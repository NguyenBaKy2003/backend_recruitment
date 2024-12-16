const express = require("express");
const router = express.Router();
const {
  User,
  UserRole,
  Applicant,
  Skill,
  Employer,
  Position,
  Category,
  Job,
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
      category_id,
      experience,
      education,
      address,
      create_by,
      skill,
      role_id,
    } = req.body;

    // Validate required fields
    if (!userName || !password || !email || !role_id) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength (example: at least 8 characters)
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    // Check for existing user
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

    // Hash the password
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
    });

    await UserRole.create({ user_id: newUser.id, role_id });

    const newApplicant = await Applicant.create({
      user_id: newUser.id,
      experience,
      education,
      create_by,
    });

    // Validate skills
    if (skill && Array.isArray(skill) && skill.length > 0) {
      const skillPromises = skill.map(async (skillObj) => {
        const { skill: skillName, category_id } = skillObj; // Destructure skill and category_id

        if (!skillName) {
          throw new Error("Skill name cannot be empty");
        }

        // Check if the skill already exists
        let skillEntry = await Skill.findOne({ where: { name: skillName } });

        // If the skill does not exist, create it with the provided category_id
        if (!skillEntry) {
          skillEntry = await Skill.create({ name: skillName, category_id });
        }

        // Create the association between the applicant and the skill
        await ApplicantSkill.create({
          applicant_id: newApplicant.id,
          skill_id: skillEntry.id,
          create_by,
        });
      });

      // Wait for all skill promises to resolve
      await Promise.all(skillPromises);
    }

    res.status(201).json({ user: newUser, applicant: newApplicant });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//
router.post("/register/employer", async (req, res) => {
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
    category_id,
    position,
    service_id,
    create_by,
    name,
    code,
  } = req.body;

  try {
    // Validate required fields
    if (
      !userName ||
      !password ||
      !email ||
      !role_id ||
      !service_id ||
      !company_name ||
      !create_by
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if the user already exists with the same username or email (case insensitive)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { userName: userName },
          { email: email.toLowerCase() }, // Ensure email is checked in lowercase
        ],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      userName,
      email: email.toLowerCase(), // Store email in lowercase
      password: hashedPassword,
      firstName,
      lastName,
      address,
      phone,
      create_by,
      status: "active",
    });

    // Create user role
    await UserRole.create({
      user_id: newUser.id,
      role_id,
      create_by,
    });

    // Check if the category exists
    let newCategory = null;
    if (name && code) {
      newCategory = await Category.findOne({ where: { name, code } });
      if (!newCategory) {
        newCategory = await Category.create({
          name,
          create_by,
          code,
        });
      }
    }

    // Create employer record
    const newEmployer = await Employer.create({
      user_id: newUser.id,
      company_name,
      company_address,
      company_introduce,
      position,
      service_id,
      create_by,
    });

    let newPosition = null;

    // Check if the position exists
    if (position && category_id) {
      newPosition = await Position.findOne({
        where: { name: position, category_id },
      });
      if (!newPosition) {
        newPosition = await Position.create({
          employer_id: newEmployer.id,
          name: position,
          create_by,
          category_id,
          code,
        });
      }
    }

    // Return success response
    res.status(201).json({
      user: newUser.toJSON(), // Use toJSON to avoid sending sensitive data
      employer: newEmployer,
      position: newPosition,
      category: newCategory,
    });
  } catch (error) {
    console.error("Error during employer registration:", error);
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
        .json({ error: "Please provide all required fields." });
    }

    // Find user by userName
    const user = await User.findOne({ where: { userName } });

    if (!user) {
      return res.status(404).json({ error: "User  doesn't exist." });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Check user role
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });
    if (!userRole || userRole.role_id !== 2) {
      return res
        .status(403)
        .json({ error: "Access denied. Only Users can log in here." });
    }

    // Find the applicant associated with the user
    const applicant = await Applicant.findOne({ where: { user_id: user.id } });
    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    // Generate the JWT token
    const accessToken = sign(
      { userName: user.userName, id: user.id, role_id: userRole.role_id },
      process.env.JWT_SECRET || "importantsecret"
      // { expiresIn: "1h" } // Token expiration time
    );

    // Respond with token and user information, including applicant_id
    res.json({
      token: accessToken,
      applicant_id: applicant.id, // Return the applicant_id
      user: {
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/login/employer", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if both userName and password are provided
    if (!userName || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Find the user by userName
    const user = await User.findOne({ where: { userName } });

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({ error: "User  doesn't exist." });
    }

    // Compare the password with the stored hashed password
    const match = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!match) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination." });
    }

    // Check role from UserRole table (assuming role_id 1 is for employers)
    const userRole = await UserRole.findOne({ where: { user_id: user.id } });

    // If the user is not an employer (role_id !== 1)
    if (!userRole || userRole.role_id !== 1) {
      return res
        .status(403)
        .json({ error: "Access denied. Only employers can log in here." });
    }

    // Fetch employer-specific information
    const employerInfo = await Employer.findOne({
      where: { user_id: user.id },
    });

    // If no employer info exists
    if (!employerInfo) {
      return res.status(404).json({ error: "Employer information not found." });
    }

    // Generate the JWT token
    const accessToken = sign(
      { userName: user.userName, id: user.id, role_id: userRole.role_id },
      process.env.JWT_SECRET || "importantsecret"
      // { expiresIn: "1h" } // Token expiration time
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
      employerId: employerInfo.id,
    });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ error: "Internal server error." });
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
