import Grade from "../models/Grade.js";

// GET all grades for the logged-in user
export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(grades);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grades." });
  }
};

// GET a single grade by ID
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findOne({ _id: req.params.id, userId: req.userId });
    if (!grade) {
      return res.status(404).json({ message: "Grade not found." });
    }
    res.status(200).json(grade);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grade." });
  }
};

// CREATE a new grade
export const createGrade = async (req, res) => {
  try {
    const { subject, score, semester, remarks } = req.body;

    const newGrade = new Grade({
      subject,
      score,
      semester,
      remarks,
      userId: req.userId,
    });

    const saved = await newGrade.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to create grade." });
  }
};

// UPDATE a grade
export const updateGrade = async (req, res) => {
  try {
    const { subject, score, semester, remarks } = req.body;

    const updated = await Grade.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // ensures user owns this grade
      { subject, score, semester, remarks },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Grade not found or unauthorized." });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update grade." });
  }
};

// DELETE a grade
export const deleteGrade = async (req, res) => {
  try {
    const deleted = await Grade.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ensures user owns this grade
    });

    if (!deleted) {
      return res.status(404).json({ message: "Grade not found or unauthorized." });
    }

    res.status(200).json({ message: "Grade deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete grade." });
  }
};

// GET stats summary for dashboard
export const getStats = async (req, res) => {
  try {
    const grades = await Grade.find({ userId: req.userId });

    if (grades.length === 0) {
      return res.status(200).json({ average: 0, highest: 0, lowest: 0, total: 0, gpa: "0.0" });
    }

    const scores = grades.map((g) => g.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    // Simple GPA calculation (4.0 scale)
    const gpa = (average / 100) * 4;

    res.status(200).json({
      average: average.toFixed(1),
      highest,
      lowest,
      total: grades.length,
      gpa: gpa.toFixed(2),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};
