// routes/categories.js
const express = require("express");
const router = express.Router();
const { Category, Position } = require("../models"); // Adjust the path as necessary

// Create a new category
router.post("/", async (req, res) => {
  try {
    const { code, name, create_by, category_id } = req.body;

    // Validate input
    if (!code || !name || !create_by) {
      return res.status(400).json({ error: "All fields are required" });
    }
    await Position.create({ category_id });
    const newCategory = await Category.create({ code, name, create_by });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a category
router.put("/:id", async (req, res) => {
  try {
    const { code, name, update_by } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update fields
    category.code = code || category.code;
    category.name = name || category.name;
    category.update_by = update_by || category.update_by;
    category.update_at = new Date(); // Update the timestamp

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    await category.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
