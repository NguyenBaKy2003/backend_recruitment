const express = require("express");
const { Job, Category, Employer, JobSkill, Skill } = require("../models");
const { FLOAT } = require("sequelize");
const router = express.Router();

// 1. Get All Jobs

router.get("/jobs", async (req, res) => {
  try {
    const { employer_id } = req.query; // Get employer_id from query parameters
    // If no employer_id is provided, return an error
    if (!employer_id) {
      return res.status(400).json({ error: "Please provide an employer_id." });
    }

    // Fetch jobs for the specified employer_id
    const jobs = await Job.findAll({
      where: {
        employer_id: employer_id, // Use dynamic employer_id from query params
      },
      include: [
        { model: Category, attributes: ["name"] },
        { model: Employer, attributes: ["company_name", "id"] },
        {
          model: Skill,
          through: JobSkill,
          attributes: ["id", "name"],
        },
      ],
    });

    // If no jobs were found for the given employer_id
    if (!jobs.length) {
      return res
        .status(404)
        .json({ error: `No jobs found for employer_id ${employer_id}.` });
    }

    // Format and send the jobs with null checks
    const formattedJobs = jobs.map((job) => {
      const skillNames = job.Skills.map((skill) => skill.name);
      const skillIds = job.Skills.map((skill) => skill.id);

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        benefit: job.benefit,
        type: job.type,
        position: job.position,
        application_deadline: job.application_deadline,
        salary: Number(job.salary),
        category: job.Category ? job.Category.name : "N/A", // Check for null
        employer: job.Employer ? job.Employer.company_name : "Unknown", // Check for null
        employerId: job.Employer ? job.Employer.id : null, // Check for null
        skillNames,
        skillIds,
      };
    });

    res.status(200).json(formattedJobs);
  } catch (error) {
    // Log the full error message to better understand the issue
    console.error("Error fetching jobs:", error);

    // Return the error message in the response for debugging
    res.status(500).json({ error: `Failed to fetch jobs: ${error.message}` });
  }
});

router.get("/jobsall", async (req, res) => {
  try {
    // Fetch all jobs without any employer_id filter
    const jobs = await Job.findAll({
      include: [
        { model: Category, attributes: ["name"] },
        { model: Employer, attributes: ["company_name", "id"] },
        {
          model: Skill,
          through: JobSkill,
          attributes: ["id", "name"],
        },
      ],
    });

    // If no jobs were found
    if (!jobs.length) {
      return res.status(404).json({ error: "No jobs found." });
    }

    // Format and send the jobs with null checks
    const formattedJobs = jobs.map((job) => {
      const skillNames = job.Skills.map((skill) => skill.name);
      const skillIds = job.Skills.map((skill) => skill.id);

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        benefit: job.benefit,
        type: job.type,
        position: job.position,
        application_deadline: job.application_deadline,
        salary: Number(job.salary),
        category: job.Category ? job.Category.name : "N/A", // Check for null
        employer: job.Employer ? job.Employer.company_name : "Unknown", // Check for null
        employerId: job.Employer ? job.Employer.id : null, // Check for null
        skillNames,
        skillIds,
      };
    });

    res.status(200).json(formattedJobs);
  } catch (error) {
    // Log the full error message to better understand the issue
    console.error("Error fetching jobs:", error);

    // Return the error message in the response for debugging
    res.status(500).json({ error: `Failed to fetch jobs: ${error.message}` });
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
        {
          model: Skill,
          through: JobSkill,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Format the job details
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      benefit: job.benefit,
      type: job.type,
      position: job.position,
      application_deadline: job.application_deadline,
      salary: job.salary,
      category: job.Category.name,
      employer: job.Employer.company_name,
      skillNames: job.Skills.map((skill) => skill.name),
      skillIds: job.Skills.map((skill) => skill.id),
    };

    res.status(200).json(formattedJob);
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ error: "Failed to fetch job details" });
  }
});

// 3. Create a New Job
router.post("/jobadd", async (req, res) => {
  const {
    title,
    description,
    location,
    benefit, // Ensure this matches your database model
    type,
    position,
    application_deadline,
    category_id,
    employer_id,
    requirements,
    salary,
    skill_id,
  } = req.body;

  try {
    // Validate required fields
    if (!title || !description || !category_id || !employer_id) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Create the new job
    const newJob = await Job.create({
      title,
      description,
      location,
      benefit, // Ensure this matches your database model
      requirements,
      type,
      position,
      application_deadline,
      category_id,
      employer_id,
      salary,
    });

    // Associate job with skill(s) (if skill_id is provided as an array)
    if (skill_id && Array.isArray(skill_id)) {
      const jobSkills = skill_id.map((id) => ({
        job_id: newJob.id,
        skill_id: id,
      }));
      await JobSkill.bulkCreate(jobSkills); // Use bulkCreate for efficiency
    }

    res.status(201).json({
      message: "Job created successfully",
      job: newJob, // Include the job in the response
      skill_id: skill_id || [], // Optionally include the associated skills
    });
  } catch (error) {
    console.error("Error creating job:", error.message); // Log the error for debugging
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
    skill_id, // Array of skill IDs
  } = req.body;

  // Start a transaction for data consistency
  const transaction = await sequelize.transaction();

  try {
    // Find the job
    const job = await Job.findByPk(id, { transaction });
    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ error: "Job not found" });
    }

    // Update job fields
    const updateFields = {
      title,
      description,
      location,
      salary,
      type,
      position,
      application_deadline,
      category_id,
      employer_id,
    };

    // Apply only non-null fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        job[key] = updateFields[key];
      }
    });

    // Save updated job
    await job.save({ transaction });

    // Handle skill updates if skill_id is provided
    if (skill_id && Array.isArray(skill_id)) {
      // Validate skill IDs
      const validSkills = await Skill.findAll({
        where: { id: skill_id },
        transaction,
      });

      if (validSkills.length !== skill_id.length) {
        await transaction.rollback();
        return res.status(400).json({ error: "Some skill IDs are invalid" });
      }

      // Remove existing job-skill associations
      await JobSkill.destroy({
        where: { job_id: id },
        transaction,
      });

      // Create new job-skill associations
      const jobSkillAssociations = skill_id.map((skillId) => ({
        job_id: id,
        skill_id: skillId,
      }));

      await JobSkill.bulkCreate(jobSkillAssociations, { transaction });
    }

    // Commit transaction
    await transaction.commit();

    // Fetch updated job with associated data
    const updatedJob = await Job.findByPk(id, {
      include: [
        { model: Category, attributes: ["name"] },
        { model: Employer, attributes: ["company_name"] },
        {
          model: Skill,
          through: JobSkill,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      id: updatedJob.id,
      title: updatedJob.title,
      description: updatedJob.description,
      location: updatedJob.location,
      salary: updatedJob.salary,
      type: updatedJob.type,
      position: updatedJob.position,
      application_deadline: updatedJob.application_deadline,
      category: updatedJob.Category.name,
      employer: updatedJob.Employer.company_name,
      skillNames: updatedJob.Skills.map((skill) => skill.name),
      skillIds: updatedJob.Skills.map((skill) => skill.id),
    });
  } catch (error) {
    // Rollback transaction in case of error
    if (transaction) await transaction.rollback();

    console.error("Job update error:", error);
    res.status(500).json({
      error: "Failed to update job",
      details: error.message,
    });
  }
});
// 5. Delete Job
router.delete("/job/:id", async (req, res) => {
  const { id } = req.params;
  const employerId = req.body.employerId || req.query.employerId; // Ensure employerId is sent from frontend

  if (!employerId) {
    return res.status(400).json({ error: "Employer ID is required" });
  }

  try {
    // Find the job by its ID
    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if the employerId matches
    if (job.employerId !== parseInt(employerId, 10)) {
      return res.status(403).json({ error: "Unauthorized to delete this job" });
    }

    // Delete the job
    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

module.exports = router;
