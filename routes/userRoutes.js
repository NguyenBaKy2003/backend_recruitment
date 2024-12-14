const express = require("express");
const { User, Employer, Role, UserRole } = require("../models"); // Adjust according to your models

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
        employer: user.Employer || null, // Employer data if exists, otherwise null
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
