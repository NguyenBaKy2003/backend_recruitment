// routes/employer.js

const express = require("express");
const { User, Employer, Job, Category } = require("../models"); // Adjust according to your models
// const Category = require("../models/Category");
const router = express.Router();
// Get list of all employers
router.get("/employers", async (req, res) => {
  try {
    // Fetch all employers with their associated User and Job data
    const employers = await Employer.findAll({
      include: [
        {
          model: User, // Join with the User model
          attributes: [
            "id",
            "userName",
            "email",
            "firstName",
            "lastName",
            "phone",
          ],
        },
        {
          model: Job, // Join with the Job model
          attributes: ["benefit"],
          include: [
            {
              model: Category, // Join with the Category model through Job
              attributes: ["name"], // Select only the 'name' field from Category
            },
          ],
        },
      ],
    });

    if (!employers.length) {
      return res.status(404).json({ error: "No employers found" });
    }

    // Respond with the list of employers
    res.json(employers);
  } catch (error) {
    console.error("Error fetching employers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/employers/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Find the employer by ID
    const employer = await Employer.findOne({
      where: { id: id }, // Use the id from the request params
      include: [
        {
          model: User, // Join with the User model
          attributes: [
            "id",
            "userName",
            "email",
            "firstName",
            "lastName",
            "phone",
          ],
        },
        {
          model: Job, // Join with the Job model
          attributes: ["benefit"],
          include: [
            {
              model: Category, // Join with the Category model through Job
              attributes: ["name"], // Select only the 'name' field from Category
            },
          ],
        },
      ],
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Respond with the employer data
    res.json(employer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/employers/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Find the employer by ID
    const employer = await Employer.findByPk(id);

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Delete the employer record
    await employer.destroy();

    // You might also want to delete the associated User record if needed:
    const user = await User.findOne({ where: { id: employer.user_id } });
    if (user) {
      await user.destroy();
    }

    res.json({ message: "Employer and associated user deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an employer's profile
router.put("/employers/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters
  const {
    userName,
    email,
    firstName,
    lastName,
    phone,
    company_name,
    company_address,
    company_introduce,
  } = req.body; // Destructure the request body

  try {
    // Find the employer by ID
    const employer = await Employer.findByPk(id, {
      include: [{ model: User }], // Include the associated User model
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Update the employer's details
    await employer.update({
      company_name,
      company_address,
      company_introduce,
    });

    // Update the associated user's details
    if (employer.User) {
      await employer.User.update({
        userName,
        email,
        firstName,
        lastName,
        phone,
      });
    }

    // Respond with the updated employer data
    res.json({ message: "Employer profile updated successfully", employer });
  } catch (error) {
    console.error("Error updating employer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/change-password/:id", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const employerId = req.params.id;

  try {
    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({ error: "Employer not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, employer.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    employer.password = hashedNewPassword;
    await employer.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
});

module.exports = router;
