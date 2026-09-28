import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  practicalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Practical",
    required: true
  },
  code: {
    type: String,
    default: ""
  },
  language: {
    type: String,
    default: "python"
  },
  files: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ["pending", "submitted", "late"],
    default: "pending"
  },
  submittedAt: {
    type: Date
  },
  score: { type: Number, default: 0, min: 0, max: 100 },
  testSummary: {
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  testResults: [{
    caseId: mongoose.Schema.Types.ObjectId,
    passed: Boolean,
    runtimeMs: Number,
    memoryKb: Number,
    actualOutput: String,
    expected: mongoose.Schema.Types.Mixed
  }],
  idempotencyKey: { type: String, sparse: true, unique: true }
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
