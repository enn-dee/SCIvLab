import express from "express";
import Evaluation from "../../models/Evaluation.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// CREATE/UPDATE EVALUATION
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { submissionId, remarks, status, rubric } = req.body;
    const teacherId = req.user.id;

    let evaluation = await Evaluation.findOne({ submissionId });

    if (evaluation) {
      evaluation.remarks = remarks;
      evaluation.status = status;
      evaluation.rubric = rubric;
      await evaluation.save();
    } else {
      evaluation = await Evaluation.create({ submissionId, teacherId, remarks, status, rubric });
    }

    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET EVALUATION BY SUBMISSION
router.get("/submission/:submissionId", authMiddleware, async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ submissionId: req.params.submissionId });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL EVALUATIONS FOR A LAB
router.get("/lab/:labId", authMiddleware, async (req, res) => {
  try {
    const evaluations = await Evaluation.find()
      .populate({
        path: "submissionId",
        populate: { path: "studentId", select: "fullName rollNumber" }
      });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PENDING EVALUATIONS COUNT (for notifications)
router.get("/pending-count", authMiddleware, async (req, res) => {
  try {
    const count = await Evaluation.countDocuments({ status: "pending" });
    res.json({ pending: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;