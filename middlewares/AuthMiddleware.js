const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) return res.json({ error: "User not logged in!" });

  try {
    const validToken = verify(accessToken, "importantsecret");
    req.user = validToken;
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};

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
