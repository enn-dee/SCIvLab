import mongoose from "mongoose";

const algorithmSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    unique: true
  },

  slug: {
    type: String,
    unique: true,
    required: true
  },

  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },

  problem: {
    statement: { type: String, required: true },

    inputFormat: { type: String },
    outputFormat: { type: String },
    constraints: { type: String },

    starterCode: {
      python: { type: String, default: "" },
      javascript: { type: String, default: "" }
    }
  },

  examples: {
    type: [
      {
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        explanation: String
      }
    ],
    default: []
  },

  testCases: {
    type: [
      {
        input: mongoose.Schema.Types.Mixed,
        expected: mongoose.Schema.Types.Mixed
      }
    ],
    default: []
  },

  theory: {
    description: String,
    timeComplexity: String,
    spaceComplexity: String
  },

  keyPoints: { type: [String], default: [] },
  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },
  
  input: mongoose.Schema.Types.Mixed,

  animationSteps: { type: Array, default: [] },

  flowChartData: {
    rawNodes: { type: Array, default: [] },
    rawEdges: { type: Array, default: [] }
  },

  code: {
    javascript: String,
    python: String
  },

  pseudocode: {
    lines: { type: [String], default: [] }
  },

  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

algorithmSchema.index({ slug: 1 });
const Algorithm =
  mongoose.models.Algorithm ||
  mongoose.model("Algorithm", algorithmSchema);

export default Algorithm;