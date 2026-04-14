import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import gradeRoutes from "./routes/grades.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/grades", gradeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Grade Tracker API is running!" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(process.env.PORT || 8800, () => {
      console.log(`Server running on port ${process.env.PORT || 8800}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
