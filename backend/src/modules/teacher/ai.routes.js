import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/roles.js";
import {
  generatePracticalDraft,
  regenerateTestCases,
  refineField,
} from "./ai.service.js";

const router = express.Router();

// All AI routes require a logged-in teacher
router.use(authMiddleware, requireRoles("teacher"));

// ─── POST /api/teacher/ai/generate-practical ────────────────────
router.post("/generate-practical", async (req, res, next) => {
  try {
    const { title, language = "c", difficulty = "intermediate" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    const draft = await generatePracticalDraft({
      title,
      language,
      difficulty,
    });

    res.json({ success: true, draft });
  } catch (error) {
    console.error("AI generate-practical error:", error.message);
    next(error);
  }
});

// ─── POST /api/teacher/ai/regenerate-test-cases ─────────────────
router.post("/regenerate-test-cases", async (req, res, next) => {
  try {
    const { title, language = "c", description = "", count = 3 } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const testCases = await regenerateTestCases({
      title,
      language,
      description,
      count,
    });

    res.json({ success: true, testCases });
  } catch (error) {
    console.error("AI regenerate-test-cases error:", error.message);
    next(error);
  }
});

// ─── POST /api/teacher/ai/refine ────────────────────────────────
router.post("/refine", async (req, res, next) => {
  try {
    const { field, currentValue, feedback, title } = req.body;

    if (!field || !currentValue || !feedback) {
      return res
        .status(400)
        .json({ error: "field, currentValue and feedback are required" });
    }

    const value = await refineField({
      field,
      currentValue,
      feedback,
      title: title || "Untitled practical",
    });

    res.json({ success: true, field, value });
  } catch (error) {
    console.error("AI refine error:", error.message);
    next(error);
  }
});

export default router;
