const express = require("express");
const { Job, Category, Employer, JobSkill } = require("../models");
const router = express.Router();

// 1. Get All Jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        { model: Category, attributes: ["name"] },
        { model: Employer, attributes: ["company_name"] },
      ],
    });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// 2. Get Job by ID
router.get("/job/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findOne({
      where: { id },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Employer, attributes: ["company_name"] },
      ],
    });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the job" });
  }
});

// 3. Create a New Job
router.post("/job", async (req, res) => {
  const {
    title,
    description,
    location,
    benefit,
    type,
    position,
    application_deadline,
    category_id,
    employer_id,
    job_id,
    skill_id,
  } = req.body;

  try {
    // Validate required fields
    if (!title || !description || !category_id || !employer_id) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Create the job-skill association
    await JobSkill.create({
      job_id,
      skill_id,
    });

    // Create the new job
    const newJob = await Job.create({
      title,
      description,
      location,
      benefit,
      type,
      position,
      application_deadline,
      category_id,
      employer_id,
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// 4. Update Job
router.put("/job/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    location,
    salary,
    type,
    position,
    application_deadline,
    category_id,
    employer_id,
  } = req.body;

  try {
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.type = type || job.type;
    job.position = position || job.position;
    job.application_deadline = application_deadline || job.application_deadline;
    job.category_id = category_id || job.category_id;
    job.employer_id = employer_id || job.employer_id;

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

// 5. Delete Job
router.delete("/job/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});

module.exports = router;
