const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? [
        "http://localhost:5173",
        "http://localhost:5175",
        "http://localhost:5174",
        "http://localhost:5173",
        "https://cnpmtlujob.vercel.app",
        "http://localhost:5176",
        "http://localhost:3001/api/employer/employers",
        "http://localhost:3001/api/employer/employers ",
        "http://localhost:3001/api/jobs/jobsall",
      ] // Replace with actual production URL when needed
    : [
        "http://localhost:5175",
        "http://localhost:5174",
        "http://localhost:5173",
      ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow credentials (e.g., cookies)
  })
);

// Log request origin for debugging
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

// Middleware
app.use(bodyParser.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRouter");
const categoriesRoutes = require("./routes/categoryRoutes");
const employerRoutes = require("./routes/employerRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const skillRoutes = require("./routes/skillRoutes");
const positionRoutes = require("./routes/positionRoutes");
// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/category", categoriesRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/skills", skillRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
