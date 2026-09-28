import mongoose from "mongoose";

const labTeacherAssignmentSchema = new mongoose.Schema({
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lab",
    required: true,
    index: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
    index: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: { type: Boolean, default: true },
}, { timestamps: true });

labTeacherAssignmentSchema.index({ labId: 1, teacherId: 1 }, { unique: true });

export default mongoose.model("LabTeacherAssignment", labTeacherAssignmentSchema);
