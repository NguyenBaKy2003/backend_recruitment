const express = require("express");
const router = express.Router();
const { Category } = require("../models"); // Adjust the path to your models

// Create a new category
router.post("/", async (req, res) => {
  try {
    const { create_by, code, name } = req.body;

    if (!name || !create_by) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newCategory = await Category.create({
      create_by,
      code,
      name,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category." });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

// Get a category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category." });
  }
});

// Update a category
router.put("/:id", async (req, res) => {
  try {
    const { code, name, update_by } = req.body;

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    await category.update({
      code,
      name,
      update_by,
      update_at: new Date(), // Update the timestamp
    });

    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category." });
  }
});

// Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    await category.update({
      delete_at: new Date(), // Set the deletion timestamp
      delete_by: req.body.delete_by, // Assuming you pass the user who deleted it
    });

    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category." });
  }
});

module.exports = router;
