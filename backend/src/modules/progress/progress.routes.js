import express from "express";
import UserProgress from "../../models/UserProgress.js";
import Algorithm from "../../models/Algorithm.js";
import { authMiddleware } from "../../middleware/auth.js";
import { runPythonCode, runSimplePythonCode } from "../../utils/runPythonCode.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { algorithmSlug } = req.body;

    if (!algorithmSlug) {
      return res.status(400).json({
        message: "algorithmSlug is required"
      });
    }

    let progress = await UserProgress.findOne({
      userId,
      algorithmSlug
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        algorithmSlug
      });
    }

    res.json({
      success: true,
      progress
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { algorithmSlug } = req.body;

    // console.log("completing... ", algorithmSlug);
    if (!algorithmSlug) {
      return res.status(400).json({
        message: "algorithmSlug required"
      });
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId, algorithmSlug },
      {
        completed: true,
        completedAt: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      progress
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get("/user-progress", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.find({ userId });
    res.json(progress);
  } catch (err) {
    console.error("Error fetching user progress:", err);
    res.status(500).json({
      error: err.message
    });
  }
});


router.get("/next-unlocked", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const algorithms = await Algorithm.find().sort({ order: 1 });

    if (!algorithms || algorithms.length === 0) {
      return res.json({
        success: true,
        nextAlgorithm: null
      });
    }

    const progress = await UserProgress.find({ userId });
    const completedSet = new Set(
      progress.filter(p => p.completed).map(p => p.algorithmSlug)
    );

    let nextAlgorithm = null;
    for (let i = 0; i < algorithms.length; i++) {
      const algo = algorithms[i];
      if (!completedSet.has(algo.slug)) {
        nextAlgorithm = algo;
        break;
      }
    }

    res.json({
      success: true,
      nextAlgorithm: nextAlgorithm
    });

  } catch (err) {
    console.error("Error in next-unlocked:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ========== EXECUTE ROUTES ==========


// Run with test cases endpoint
router.post("/execute/run", authMiddleware, async (req, res) => {
  try {
    const { code, language, algoId } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: "Code is required" });
    }
    if (language !== "python") {
      return res.status(400).json({
        success: false,
        error: "Only Python supported",
      });
    }

    if (!code.includes("def solution(")) {
      return res.status(400).json({
        success: false,
        error: "Define a solution() function",
      });
    }

    const algorithm = await Algorithm.findOne({ slug: algoId });

    if (!algorithm || !algorithm.testCases.length) {
      return res.status(400).json({
        success: false,
        error: "No test cases found",
      });
    }

    const results = await runPythonCode(code, algorithm.testCases);

    res.json({
      success: true,
      results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// router.post("/submissions/save", authMiddleware, async (req, res) => {
//   const { algorithmSlug, code, language, passed } = req.body;
//   const submission = await AlgorithmSubmission.findOneAndUpdate(
//     { userId: req.user.id, algorithmSlug },
//     { code, language, passed, updatedAt: new Date() },
//     { upsert: true, new: true }
//   );
//   res.json({ success: true, submission });
// });

// router.delete("/submissions/reset/:slug", authMiddleware, async (req, res) => {
//   await AlgorithmSubmission.findOneAndDelete({
//     userId: req.user.id,
//     algorithmSlug: req.params.slug
//   });
//   res.json({ success: true });
// });


export default router;