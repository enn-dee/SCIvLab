import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  remarks: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  rubric: [{
    criteria: String,
    score: Number,
    maxScore: Number,
    comment: String
  }]
}, { timestamps: true });

export default mongoose.model("Evaluation", evaluationSchema);