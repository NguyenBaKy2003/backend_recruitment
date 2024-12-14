const express = require("express");
const router = express.Router();
const { Service } = require("../models"); // Assuming Sequelize is set up and `Service` model is defined.

// Create a new service
router.post("/", async (req, res) => {
  try {
    const { jobPostNumber, service_name, price, status, create_by } = req.body;

    if (!service_name || !price || !create_by) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newService = await Service.create({
      jobPostNumber,
      service_name,
      price,
      status,
      create_by,
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create service." });
  }
});

// Get all service
router.get("/", async (req, res) => {
  try {
    const service = await Service.findAll();
    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch service." });
  }
});

// Get a service by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch service." });
  }
});

// Update a service by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, price, status, update_by } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    await service.update({
      service_name,
      price,
      status,
      update_by,
      update_at: new Date(),
    });

    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update service." });
  }
});

// Delete a service by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { delete_by } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found." });
    }

    await service.update({
      delete_by,
      delete_at: new Date(),
    });

    // Optional: If you want to hard delete instead of soft delete
    // await service.destroy();

    res.status(200).json({ message: "Service deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete service." });
  }
});

module.exports = router;
