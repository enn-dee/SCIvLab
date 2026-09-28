import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  algorithm: String,

  completedSections: {
    type: [String],
    default: []
  }
});

export default mongoose.model("Assignment", assignmentSchema);