import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
    index: true,
  },
  enrolledStudentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  instructions: { type: String, default: "" },
  language: { type: String, enum: ["python", "cpp", "c", "java"], default: "python" },
  deadline: { type: Date },
  startTime: { type: Date },
  endTime: { type: Date },
  status: { type: String, enum: ["draft", "published"], default: "published" },
}, { timestamps: true });

export default mongoose.model("Exam", examSchema);
