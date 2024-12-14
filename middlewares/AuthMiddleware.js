const { verify } = require("jsonwebtoken");

function validateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No authorization token provided",
      success: false,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired. Please log in again",
        success: false,
      });
    }
    return res.status(401).json({
      error: "Invalid authentication token",
      success: false,
    });
  }
}
const validateRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization");

      if (!token) {
        return res.status(401).json({ error: "Access denied" });
      }

      const decoded = verify(
        token,
        process.env.JWT_SECRET || "importantsecret"
      );

      // Check if the user's role_id matches one of the allowed roles
      if (!roles.includes(decoded.role_id)) {
        return res.status(403).json({ error: "You do not have permission" });
      }

      req.user = decoded; // Store user data in the request object
      next();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
};

module.exports = { validateToken, validateRole };
