import express from "express";
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getStats,
} from "../controllers/gradeController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// All routes below are protected — user must be logged in
router.use(verifyToken);

// GET /api/grades/stats  ← must come before /:id
router.get("/stats", getStats);

// GET    /api/grades         → get all grades for logged-in user
// POST   /api/grades         → create a new grade
router.get("/", getGrades);
router.post("/", createGrade);

// GET    /api/grades/:id     → get one grade
// PUT    /api/grades/:id     → update a grade
// DELETE /api/grades/:id     → delete a grade
router.get("/:id", getGradeById);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);

export default router;
