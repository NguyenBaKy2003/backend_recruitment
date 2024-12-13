const express = require("express");
const router = express.Router();
const {
  User,
  UserRole,
  Applicant,
  Skill,
  ApplicantSkill,
} = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const {
      userName,
      password,
      email,
      firstName,
      lastName,
      phone,
      experience,
      education,
      address,
      create_by,
      skill,
      role_id,
      // Thêm role_id vào đây
    } = req.body;

    if (!userName || !password || !email || !role_id) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      address,
      phone,
      create_by,
      status: "active",
      // Lưu role_id vào User
    });
    await UserRole.create({ user_id: newUser.id, role_id });

    const newApplicant = await Applicant.create({
      user_id: newUser.id,
      experience,
      education,
      create_by,
    });

    if (skill && skill.length > 0) {
      const skillPromises = skill.map(async (name) => {
        let skill = await Skill.findOne({ where: { name } });
        if (!skill) {
          skill = await Skill.create({ name });
        }
        await ApplicantSkill.create({
          applicant_id: newApplicant.id,
          skill_id: skill.id,
          create_by,
        });
      });
      await Promise.all(skillPromises);
    }

    res.status(201).json({ user: newUser, applicant: newApplicant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const user = await User.findOne({ where: { userName } });

    if (!user) {
      return res.status(404).json({ error: "User  Doesn't Exist" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong Username And Password Combination" });
    }

    const accessToken = sign(
      { username: user.userName, id: user.id, role_id: user.role_id }, // Thêm role_id vào payload
      process.env.JWT_SECRET || "importantsecret"
    );
    res.json({
      token: accessToken,
      username: user.userName,
      id: user.id,
      role_id: user.role_id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auth Route
router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

// Basic Info Route
router.get("/basicinfo/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const basicInfo = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!basicInfo) {
      return res.status(404).json({ error: "User  not found" });
    }

    res.json(basicInfo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change Password Route
router.put("/changepassword", validateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const user = await User.findOne({ where: { userName: req.user.username } });

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(401).json({ error: "Wrong Password Entered!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword },
      { where: { userName: req.user.username } }
    );
    res.json("SUCCESS");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
