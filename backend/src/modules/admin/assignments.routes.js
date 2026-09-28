import express from "express";
import Assignment from "../../models/Assignment.js";
import { authMiddleware, adminOnly } from "../../middleware/auth.js";

const router = express.Router();

// ASSIGN
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { studentId, algorithm } = req.body;

  const assign = await Assignment.create({
    studentId,
    algorithm
  });

  res.json(assign);
});

// GET MY
router.get("/me", authMiddleware, async (req, res) => {
  const data = await Assignment.find({ studentId: req.user.id });
  res.json(data);
});

export default router;