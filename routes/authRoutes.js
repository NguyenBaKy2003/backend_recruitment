const express = require("express");
const router = express.Router();
const {
  User,
  UserRole,
  Applicant,
  Skill,
  Employer,
  Position,
  Service,
  ApplicantSkill,
} = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { Op } = require("sequelize");
const { sign } = require("jsonwebtoken");

// Register Route
router.post("/register/user", async (req, res) => {
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

router.post("/register/employer", async (req, res) => {
  try {
    const {
      userName,
      password,
      email,
      firstName,
      lastName,
      phone,
      company_address,
      company_introduce,
      company_name,
      address,
      role_id,
      position,
      service_id, // Assuming service_id is passed in the request body
      create_by, // Assuming 'create_by' is passed in request body
    } = req.body;

    // Check if the user already exists with the same username or email
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

    // Validate if required fields are provided
    if (!userName || !password || !email || !role_id || !service_id) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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
    });

    // Assign role to user (UserRole table)
    await UserRole.create({
      user_id: newUser.id,
      role_id,
      create_by,
    });

    // Create Employer record (assuming you have an 'Employer' table)
    const newEmployer = await Employer.create({
      user_id: newUser.id,
      company_name,
      company_address,
      company_introduce,
      position,
      service_id, // Store service_id for the employer
      create_by,
    });

    let newPosition = null;
    // If position is provided, create a Position entry
    if (position) {
      newPosition = await Position.create({
        employer_id: newEmployer.id,
        name: position,
        create_by,
      });
    }

    // Return the response
    res.status(201).json({
      user: newUser,
      employer: newEmployer,
      position: newPosition,
    });
  } catch (error) {
    console.error("Error during employer registration:", error); // Improved logging for debugging
    res.status(400).json({ error: error.message });
  }
});

router.post("/login/user", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Validate input
    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Find user by userName
    const user = await User.findOne({ where: { userName } });

    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination" });
    }

    // Check user role
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });
    if (!userRole || userRole.role_id !== 2) {
      return res
        .status(403)
        .json({ error: "Access denied. Only User can log in here." });
    }

    // Generate JWT token
    const accessToken = sign(
      {
        username: user.userName,
        id: user.id,
        role_id: userRole.role_id,
      },
      process.env.JWT_SECRET || "importantsecret",
      { expiresIn: "1h" } // Token expiration time
    );

    // Respond with token and user information
    res.json({
      token: accessToken,
      user: {
        userName: user.userName,
        id: user.id,
        role_id: userRole.role_id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login/employer", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if both userName and password are provided
    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Find the user by userName
    const user = await User.findOne({ where: { userName } });

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Compare the password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination" });
    }

    // Check role from UserRole table (assuming role_id 1 is for employers)
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });

    // If the user is not an employer (role_id !== 2)
    if (!userRole || userRole.role_id !== 1) {
      return res
        .status(403)
        .json({ error: "Access denied. Only employers can log in here." });
    }

    // Fetch employer-specific information (you can adjust this to fit your schema)
    const employerInfo = await Employer.findOne({
      where: { user_id: user.id },
    });

    // If no employer info exists
    if (!employerInfo) {
      return res.status(404).json({ error: "Employer information not found" });
    }

    // Generate the JWT token
    const accessToken = sign(
      { userName: user.userName, id: user.id, role_id: userRole.role_id },
      process.env.JWT_SECRET || "importantsecret"
    );

    // Return the response with token and employer info
    res.json({
      token: accessToken,
      employer: {
        userName: user.userName,
        id: user.id,
        role_id: userRole.role_id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        company_name: employerInfo.company_name, // Example employer info
        company_address: employerInfo.company_address, // Example employer info
        company_introduce: employerInfo.company_introduce,
        position: employerInfo.position,
      },
      id: user.id,
      // Example employer info
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
