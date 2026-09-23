const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "F-096 Backend API is running"
  });
});

// API health route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "F-096 Backend",
    status: "healthy"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`F-096 Backend running on port ${PORT}`);
});