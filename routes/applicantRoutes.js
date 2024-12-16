const express = require("express");
const router = express.Router();
const { Applicant, ApplicantSkill, Skill, User } = require("../models"); // Adjust the path as necessary

// Create a new applicant
router.post("/applicants", async (req, res) => {
  const { create_by, education, experience, user_id } = req.body;

  try {
    const newApplicant = await Applicant.create({
      create_by,
      education,
      experience,
      user_id,
    });

    res.status(201).json({
      message: "Applicant created successfully",
      applicant: newApplicant,
    });
  } catch (error) {
    console.error("Error creating applicant:", error);
    res.status(500).json({ error: "Failed to create applicant" });
  }
});

// Get all applicants
router.get("/applicants", async (req, res) => {
  try {
    const applicants = await Applicant.findAll({
      include: [
        {
          model: Skill, // Join with Skill through ApplicantSkill
          attributes: ["name"], // Only fetch skill names
          through: {
            model: ApplicantSkill,
            attributes: [], // Don't include ApplicantSkill attributes
          },
        },
        {
          model: User, // Include User information
          attributes: ["id", "userName", "email", "firstName", "lastName"], // Specify the fields you want to return
        },
      ],
    });

    res.status(200).json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

// Get a single applicant by ID
// Get a single applicant by ID with user and skills information
router.get("/applicants/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const applicant = await Applicant.findByPk(id, {
      include: [
        {
          model: Skill, // Join with Skill through ApplicantSkill
          attributes: ["name"], // Only fetch skill names
          through: {
            model: ApplicantSkill,
            attributes: [], // Don't include ApplicantSkill attributes
          },
        },
        {
          model: User, // Include User information
          attributes: ["id", "userName", "email", "firstName", "lastName"], // Specify the fields you want to return
        },
      ],
    });

    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    res.status(200).json(applicant);
  } catch (error) {
    console.error("Error fetching applicant:", error);
    res.status(500).json({ error: "Failed to fetch applicant" });
  }
});

// Update an applicant
router.put("/applicants/:id", async (req, res) => {
  const { id } = req.params;
  const { update_by, education, experience, user_id } = req.body;

  try {
    const applicant = await Applicant.findByPk(id);
    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    // Update the applicant's details
    await applicant.update({
      update_by,
      education,
      experience,
      user_id,
      update_at: new Date(), // Update the timestamp
    });

    res.status(200).json({
      message: "Applicant updated successfully",
      applicant,
    });
  } catch (error) {
    console.error("Error updating applicant:", error);
    res.status(500).json({ error: "Failed to update applicant" });
  }
});

// Delete an applicant
router.delete("/applicants/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const applicant = await Applicant.findByPk(id);
    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found" });
    }

    // Soft delete: set delete_at and delete_by
    await applicant.update({
      delete_at: new Date(),
      delete_by: req.body.delete_by, // Assuming delete_by is sent in the request body
    });

    res.status(200).json({
      message: "Applicant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting applicant:", error);
    res.status(500).json({ error: "Failed to delete applicant" });
  }
});

module.exports = router;
