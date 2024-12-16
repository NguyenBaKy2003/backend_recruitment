const express = require("express");
const router = express.Router();
const { Position } = require("../models"); // Adjust the path to your models

// Create a new position
router.post("/", async (req, res) => {
  try {
    const { create_by, name, category_id } = req.body;

    if (!name || !category_id || !create_by) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newPosition = await Position.create({
      create_by,
      name,
      category_id,
    });

    res.status(201).json(newPosition);
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ error: "Failed to create position." });
  }
});

// Get all positions
router.get("/", async (req, res) => {
  try {
    const positions = await Position.findAll();
    res.json(positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Failed to fetch positions." });
  }
});

// Get a position by ID
router.get("/:id", async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ error: "Position not found." });
    }
    res.json(position);
  } catch (error) {
    console.error("Error fetching position:", error);
    res.status(500).json({ error: "Failed to fetch position." });
  }
});

// Update a position
router.put("/:id", async (req, res) => {
  try {
    const { name, category_id, update_by } = req.body;

    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ error: "Position not found." });
    }

    await position.update({
      name,
      category_id,
      update_by,
      update_at: new Date(), // Update the timestamp
    });

    res.json(position);
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Failed to update position." });
  }
});

// Delete a position
router.delete("/:id", async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ error: "Position not found." });
    }

    await position.update({
      delete_at: new Date(), // Set the deletion timestamp
      delete_by: req.body.delete_by, // Assuming you pass the user who deleted it
    });

    res.json({ message: "Position deleted successfully." });
  } catch (error) {
    console.error("Error deleting position:", error);
    res.status(500).json({ error: "Failed to delete position." });
  }
});

module.exports = router;
