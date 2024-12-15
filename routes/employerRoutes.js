// routes/employer.js

const express = require("express");
const { User, Employer } = require("../models"); // Adjust according to your models
const router = express.Router();
// Get list of all employers
router.get("/employers", async (req, res) => {
  try {
    // Fetch all users who are employers (assuming that employer data is stored in the Employer table)
    const employers = await Employer.findAll({
      include: {
        model: User, // Join with the User model
        attributes: [
          "id",
          "userName",
          "email",
          "firstName",
          "lastName",
          "phone",
        ], // Select relevant user attributes
      },
    });

    if (!employers.length) {
      return res.status(404).json({ error: "No employers found" });
    }

    // Respond with the list of employers
    res.json(employers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/employers/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the request parameters

  try {
    // Find the employer by ID
    const employer = await Employer.findOne({
      where: { id: id }, // Use the id from the request params
      include: {
        model: User, // Join with the User model
        attributes: [
          "id",
          "userName",
          "email",
          "firstName",
          "lastName",
          "phone",
        ], // Select relevant user attributes
      },
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

module.exports = router;
