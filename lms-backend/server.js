const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const quizRoutes = require("./routes/quizRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

connectDB();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BIT LMS Backend is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy ✅",
    database: "MongoDB connected",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/submissions", submissionRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});