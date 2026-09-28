import mongoose from "mongoose";

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    required: true,
    trim: true
  },
  session: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher"
  },
  kind: {
    type: String,
    enum: ["academic", "private"],
    default: "private",
    index: true
  },
  ownerTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    index: true
  },
  deadline: { type: Date },
  rules: {
    lateSubmissionAllowed: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ["current", "previous"],
    default: "current"
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  batches: [{
    name: String,
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  }]
}, { timestamps: true });

export default mongoose.model("Lab", labSchema);
