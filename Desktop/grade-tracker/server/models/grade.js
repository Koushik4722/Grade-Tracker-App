import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot exceed 100"],
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-calculate grade letter before saving
gradeSchema.pre("save", function (next) {
  this.grade = calculateGrade(this.score);
  next();
});

gradeSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.score !== undefined) {
    update.grade = calculateGrade(update.score);
  }
  next();
});

function calculateGrade(score) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export default mongoose.model("Grade", gradeSchema);
