import mongoose from "mongoose";

const practicalSchema = new mongoose.Schema({
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lab",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    instructions: {
        type: String,
        default: ""
    },
    materials: [{
        name: String,
        url: String
    }],
    deadline: {
        type: Date
    },
    order: {
      type: Number,
      default: 0
    },
    starterTemplate: {
      python: {
        prefix: { type: String, default: "" },
        suffix: { type: String, default: "" },
        starterSolution: { type: String, default: "" }
      },
      javascript: {
        prefix: { type: String, default: "" },
        suffix: { type: String, default: "" },
        starterSolution: { type: String, default: "" }
      },
      c: {
        prefix: { type: String, default: "" },
        suffix: { type: String, default: "" },
        starterSolution: { type: String, default: "" }
      },
      cpp: {
        prefix: { type: String, default: "" },
        suffix: { type: String, default: "" },
        starterSolution: { type: String, default: "" }
      },
      java: {
        prefix: { type: String, default: "" },
        suffix: { type: String, default: "" },
        starterSolution: { type: String, default: "" }
      }
    },
    testCases: [{
      input: mongoose.Schema.Types.Mixed,
      expected: { type: mongoose.Schema.Types.Mixed, default: "" },
      visibility: { type: String, enum: ["public", "hidden"], default: "hidden" },
      weight: { type: Number, default: 1, min: 0 },
      checker: { type: String, default: null }
    }],
    execution: {
      enabled: { type: Boolean, default: true },
      allowedLanguages: { type: [String], default: ["python"] },
      timeLimitSeconds: { type: Number, default: 2, min: 1, max: 15 },
      memoryLimitKb: { type: Number, default: 128000, min: 16000 }
    }
}, { timestamps: true });

export default mongoose.model("Practical", practicalSchema);
