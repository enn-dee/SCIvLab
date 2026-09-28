import express from "express";
import User from "../../models/User.js";
import Algorithm from "../../models/Algorithm.js";
import Submission from "../../models/Submission.js";
import UserProgress from "../../models/UserProgress.js";
import { authMiddleware, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

router.get("/stats", authMiddleware, adminOnly,
  async (req, res) => {
    try {

      const totalStudents = await User.countDocuments({
        role: "student"
      });

      const totalAlgorithms =
        await Algorithm.countDocuments();

      const totalSubmissions =
        await Submission.countDocuments();

      const completedAlgorithms =
        await UserProgress.countDocuments({
          completed: true
        });

      const recentProgress =
        await UserProgress.find({ completed: true })
          .sort({ completedAt: -1 })
          .limit(5);

      res.json({
        totalStudents,
        totalAlgorithms,
        totalSubmissions,
        completedAlgorithms,
        recentProgress
      });

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;