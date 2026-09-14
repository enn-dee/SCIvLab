import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, default: "superadmin" },
  },
  { timestamps: true },
);

export default mongoose.model("SuperAdmin", superAdminSchema);
