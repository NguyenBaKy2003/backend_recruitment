const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:5173"] // Replace with actual production URL when needed
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

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
