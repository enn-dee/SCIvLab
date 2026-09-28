import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "teacher"
  }
}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);