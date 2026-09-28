import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lab",
    required: true
  },
  practicalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Practical",
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ["lab", "lecture"],
    required: true
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    default: "present"
  }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, date: 1, type: 1 });

export default mongoose.model("Attendance", attendanceSchema);