import mongoose from "mongoose";

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  practicalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Practical",
    required: true
  },
  viva: { type: Number, default: 0 },
  execution: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  internal: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

marksSchema.pre("save", function () {
  this.total =
    (this.viva || 0) +
    (this.execution || 0) +
    (this.attendance || 0) +
    (this.internal || 0);
});

marksSchema.index({ studentId: 1, practicalId: 1 }, { unique: true });

const Marks = mongoose.models.Marks || mongoose.model("Marks", marksSchema);

export default Marks;