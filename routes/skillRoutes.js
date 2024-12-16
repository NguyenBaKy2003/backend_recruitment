const express = require("express");
const router = express.Router();
const { Skill } = require("../models"); // Adjust the path to your models

// Create a new skill
router.post("/", async (req, res) => {
  try {
    const { create_by, name, category_id } = req.body;

    if (!name || !category_id || !create_by) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newSkill = await Skill.create({
      create_by,
      name,
      category_id,
    });

    res.status(201).json(newSkill);
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ error: "Failed to create skill." });
  }
});

// Get all skills
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills." });
  }
});

// Get a skill by ID
router.get("/:id", async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found." });
    }
    res.json(skill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({ error: "Failed to fetch skill." });
  }
});

// Update a skill
router.put("/:id", async (req, res) => {
  try {
    const { name, category_id, update_by } = req.body;

    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found." });
    }

    await skill.update({
      name,
      category_id,
      update_by,
      update_at: new Date(), // Update the timestamp
    });

    res.json(skill);
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ error: "Failed to update skill." });
  }
});

// Delete a skill
router.delete("/:id", async (req, res) => {
  try {
    const skill = await Skill.findByPk(req.params.id);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found." });
    }

    await skill.update({
      delete_at: new Date(), // Set the deletion timestamp
      delete_by: req.body.delete_by, // Assuming you pass the user who deleted it
    });

    res.json({ message: "Skill deleted successfully." });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ error: "Failed to delete skill." });
  }
});

module.exports = router;
