import mongoose from "mongoose";

const examSubmissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  code: { type: String, default: "" },
  language: { type: String, default: "python" },
  status: { type: String, enum: ["submitted"], default: "submitted" },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

examSubmissionSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model("ExamSubmission", examSubmissionSchema);
