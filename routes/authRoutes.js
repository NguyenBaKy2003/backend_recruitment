const express = require("express");
const router = express.Router();
const {
  User,
  UserRole,
  Applicant,
  Skill,
  Role,
  ApplicantSkill,
} = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { Op } = require("sequelize");
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
    } = req.body;
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ userName: userName }, { email: email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or Username already exists" });
    }
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

// login user

// // Login Route
// Employer Login
router.post("/login/employer", async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const user = await User.findOne({ where: { userName } });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination" });
    }

    // Check role from UserRole table
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });

    if (!userRole || userRole.role_id !== 1) {
      return res
        .status(403)
        .json({ error: "Access denied. Only employers can log in here." });
    }

    const accessToken = sign(
      { username: user.userName, id: user.id, role_id: userRole.role_id },
      process.env.JWT_SECRET || "importantsecret"
    );

    res.json({
      token: accessToken,
      username: user.userName,
      id: user.id,
      role_id: userRole.role_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post("/login/user", async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    const user = await User.findOne({ where: { userName } });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination" });
    }

    // Check role from UserRole table
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });

    if (!userRole || userRole.role_id !== 2) {
      return res
        .status(403)
        .json({ error: "Access denied. Only regular users can log in here." });
    }

    const accessToken = sign(
      { userName: user.userName, id: user.id, role_id: userRole.role_id },
      process.env.JWT_SECRET || "importantsecret"
    );

    res.json({
      token: accessToken,
      userName: user.userName,
      id: user.id,
      role_id: userRole.role_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { validateRole } = require("../middlewares/AuthMiddleware");

module.exports = router;
// Example: Route only accessible by users with role_id 1 (Admin)
router.get("/admin", validateRole([1]), (req, res) => {
  res.status(200).json({ message: "Welcome Admin!" });
});

// Example: Route only accessible by users with role_id 2 (User)
router.get("/user", validateRole([2]), (req, res) => {
  res.status(200).json({ message: "Welcome User!" });
});

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
