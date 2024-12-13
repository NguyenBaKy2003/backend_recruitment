const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["http://your-production-url.com"] // Replace with actual production URL
    : [
        "http://localhost:5175",
        "http://localhost:5174",
        "http://localhost:5173",
      ];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Set to false if cookies are not needed
  })
);

// Middleware
app.use(bodyParser.json());

// Import routes
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
