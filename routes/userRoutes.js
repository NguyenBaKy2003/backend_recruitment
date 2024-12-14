const express = require("express");
const router = express.Router();
const { User, Applicant, Skill, Role, ApplicantSkill } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/profile", validateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from validated token

    // Query user profile with associated data
    const userProfile = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["password", "createdAt"], // Exclude sensitive fields
      },
      include: [
        {
          model: Role,
          attributes: ["id", "role_name"],
          through: { attributes: [] },
        },
        {
          model: Applicant,
          attributes: ["experience", "education"],
          include: [
            {
              model: Skill,
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    // Additional check for user existence
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    // Sanitize the response to remove any potential sensitive data
    const sanitizedProfile = userProfile.toJSON();
    delete sanitizedProfile.password;

    res.status(200).json({
      success: true,
      data: sanitizedProfile,
    });
  } catch (error) {
    console.error("Profile retrieval error:", error);

    // More specific error handling
    res.status(500).json({
      success: false,
      message: "Unable to retrieve user profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
