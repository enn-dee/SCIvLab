import express from "express";
import AlgorithmSubmission from "../../models/AlgorithmSubmission.js";
import Algorithm from "../../models/Algorithm.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// GET all user's algorithm submissions. This must precede `/:slug`.
router.get("/user/all", authMiddleware, async (req, res) => {
  try {
    const submissions = await AlgorithmSubmission.find({
      userId: req.user.id,
    }).sort({ updatedAt: -1 });

    res.json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching all submissions:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET saved code for an algorithm
router.get("/:slug", authMiddleware, async (req, res) => {
  try {
    // console.log("Fetching submission for:", req.params.slug, "User:", req.user.id);
    const submission = await AlgorithmSubmission.findOne({
      userId: req.user.id,
      algorithmSlug: req.params.slug,
    });
    res.json({
      success: true,
      submission: submission || null,
    });
  } catch (err) {
    console.error("Error fetching submission:", err);
    res.status(500).json({ error: err.message });
  }
});

// SAVE code for an algorithm
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { algorithmSlug, code, language, passed } = req.body;
    // console.log("Saving submission:", {
    //   algorithmSlug,
    //   userId: req.user.id,
    //   passed,
    // });

    const submission = await AlgorithmSubmission.findOneAndUpdate(
      {
        userId: req.user.id,
        algorithmSlug,
      },
      {
        code,
        language: language || "python",
        passed: passed || false,
        ...(passed && { completedAt: new Date() }),
      },
      { upsert: true, new: true },
    );

    // console.log("Saved submission:", submission._id);
    res.json({
      success: true,
      submission,
    });
  } catch (err) {
    console.error("Error saving submission:", err);
    res.status(500).json({ error: err.message });
  }
});

// RESET code for an algorithm
router.delete("/reset/:slug", authMiddleware, async (req, res) => {
  try {
    const algorithm = await Algorithm.findOne({ slug: req.params.slug });
    const defaultCode =
      algorithm?.problem?.starterCode?.python ||
      `def solution():\n    # Write your code here\n    pass`;

    const submission = await AlgorithmSubmission.findOneAndUpdate(
      {
        userId: req.user.id,
        algorithmSlug: req.params.slug,
      },
      {
        code: defaultCode,
        passed: false,
        completedAt: null,
      },
      { upsert: true, new: true },
    );

    res.json({
      success: true,
      submission,
      message: "Code reset to template",
    });
  } catch (err) {
    console.error("Error resetting submission:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
