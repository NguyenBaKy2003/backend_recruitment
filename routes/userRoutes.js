const express = require("express");
const {
  User,
  Employer,
  Role,
  UserRole,
  Skill,
  Applicant,
  ApplicantSkill,
} = require("../models"); // Adjust according to your models

const router = express.Router();

// Get list of all users and their employer information
router.get("/users-and-employers", async (req, res) => {
  try {
    // Fetch all users, join with Employer table and UserRole table to get role data
    const users = await User.findAll({
      include: [
        {
          model: Employer, // Join with Employer to get employer-specific data if available
          required: false, // If no employer data exists, still return the user data
        },
        {
          model: Role, // Join with Role to get the role of the user (Employer, Employee, etc.)
          attributes: ["role_name"],
          through: {
            model: UserRole,
            attributes: ["role_id"], // Don't include UserRole attributes, just use Role data
          },
          required: true, // Ensure the user has a role
        },
      ],
    });

    if (!users.length) {
      return res.status(404).json({ error: "No users found" });
    }

    // Format the response to include the user data and role info
    const formattedUsers = users.map((user) => {
      const userRole = user.Roles[0] || {}; // Safely access the first role

      return {
        id: user.id,
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role_id: userRole.id || null, // Get the role_id from the Roles table
        role: userRole.role_name || "Unknown", // Get the role name, default to "Unknown"
        phone: user.phone,
        address: user.address,
        employer: user.Employer || null, // Employer data if exists, otherwise null
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/user/:id", async (req, res) => {
  const { id } = req.params; // Get the user ID from the request parameters

  try {
    // Convert id to an integer if necessary
    const userId = parseInt(id, 10);

    // Fetch user by ID, join with Role, Applicant, and Skill data
    const user = await User.findOne({
      where: { id: userId }, // Filter by the provided ID
      include: [
        {
          model: Role, // Join with Role to get the role of the user (Employer, Employee, etc.)
          attributes: ["role_name"],
          through: {
            model: UserRole,
            attributes: [], // Don't include UserRole attributes, just use Role data
          },
          required: true, // Ensure the user has a role
        },
        {
          model: Applicant, // Join with Applicant to get experience and education data
          attributes: ["experience", "education"], // Only fetch experience and education
          required: false, // It's optional, if the user doesn't have an associated applicant data
          include: [
            {
              model: Skill, // Join with Skill through ApplicantSkill
              attributes: ["name"], // Only fetch skill names
              through: {
                model: ApplicantSkill,
                attributes: [], // Don't include ApplicantSkill attributes
              },
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User  not found" });
    }

    // Access the first role (the user can have multiple roles)
    const userRole = user.Roles[0] || {}; // Safely access the first role

    // Format the response to include the user data, role, and applicant info (experience, education, skills)
    const formattedUser = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role_id: userRole.id || null, // Get the role_id from the Roles table
      role: userRole.role_name || "Unknown", // Get the role name, default to "Unknown"
      phone: user.phone,
      address: user.address,
      experience: user.Applicant ? user.Applicant.experience : null, // Experience from Applicant model
      education: user.Applicant ? user.Applicant.education : null, // Education from Applicant model
      skills:
        user.Applicant && user.Applicant.Skills
          ? user.Applicant.Skills.map((skill) => skill.name)
          : [], // Get skills as an array of names
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user data:", error); // Log the specific error message
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
});

router.put("/change-password/:id", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User  not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

module.exports = router;
