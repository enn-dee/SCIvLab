import mongoose from "mongoose";



const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  algorithmSlug: {
    type: String,
    required: true
  },

  completed: {
    type: Boolean,
    default: false
  },

  completedAt: Date
});

userProgressSchema.index(
  { userId: 1, algorithmSlug: 1 },
  { unique: true }
);

export default mongoose.model("UserProgress", userProgressSchema);