// applyJobRoutes.js
const express = require("express");
const router = express.Router();
const { ApplyJob, Job } = require("../models"); // Adjust the path as necessary

// Create a new job application
router.post("/apply_job", async (req, res) => {
  const { applicant_id, job_id } = req.body;

  try {
    // Check if the job exists
    const job = await Job.findByPk(job_id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Create the application
    const newApplication = await ApplyJob.create({
      applicant_id,
      job_id,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ error: "Failed to apply for job" });
  }
});
// Get all job applications
router.get("/", async (req, res) => {
  try {
    const applications = await ApplyJob.findAll();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get a specific job application by applicant_id and job_id
router.get("/:applicant_id/:job_id", async (req, res) => {
  const { applicant_id, job_id } = req.params;
  try {
    const application = await ApplyJob.findOne({
      where: { applicant_id, job_id },
    });
    if (application) {
      res.status(200).json(application);
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Delete a job application
router.delete("/:applicant_id/:job_id", async (req, res) => {
  const { applicant_id, job_id } = req.params;
  try {
    const deleted = await ApplyJob.destroy({
      where: { applicant_id, job_id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

module.exports = router;
