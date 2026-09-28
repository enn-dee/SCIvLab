import mongoose from "mongoose";

const algorithmSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  algorithmSlug: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: "python"
  },
  passed: {
    type: Boolean,
    default: false
  },
  testResults: {
    type: Array,
    default: []
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

algorithmSubmissionSchema.index({ userId: 1, algorithmSlug: 1 }, { unique: true });

export default mongoose.model("AlgorithmSubmission", algorithmSubmissionSchema);