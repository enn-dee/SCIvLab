import mongoose from "mongoose";

const examPenaltySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  windowChangeCount: { type: Number, default: 0 },
  fullscreenExitCount: { type: Number, default: 0 },
}, { timestamps: true });

examPenaltySchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model("ExamPenalty", examPenaltySchema);
