import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lab",
    required: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "withdrawn"],
    default: "active",
  },
}, { timestamps: true });

enrollmentSchema.index({ labId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
