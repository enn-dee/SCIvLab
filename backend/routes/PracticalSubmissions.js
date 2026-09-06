import express from "express";
import Submission from "../models/Submission.js";
import Practical from "../models/Practical.js";
import Evaluation from "../models/Evaluation.js";
import { authMiddleware } from "../middleware/auth.js";
import { loadPracticalLab, requireLabAccess } from "../middleware/labAccess.js";
import { runJudge0Cases, runJudge0Simple } from "../utils/judge0.js";
import { runLocalCases, runLocalExecution } from "../utils/localExecution.js";

const router = express.Router();
const MAX_SOURCE_LENGTH = 100_000;

const loadPractical = async (req, res, next) => {
  try {
    const practicalId = req.params.practicalId || req.body.practicalId;
    const practical = await Practical.findById(practicalId);
    if (!practical)
      return res.status(404).json({ error: "Practical not found" });
    req.practical = practical;
    next();
  } catch (error) {
    next(error);
  }
};

const exposeResults = (results, testCases) =>
  results.map((result, index) => {
    const testCase = testCases[index];
    if (testCase.visibility === "public") {
      return { ...result, expected: testCase.expected };
    }
    return { caseId: result.caseId, passed: result.passed, hidden: true };
  });

const resolveLanguage = (practical, submissionLanguage) => {
  const allowed = practical.execution?.allowedLanguages?.length
    ? practical.execution.allowedLanguages
    : ["python"];
  if (allowed.includes(submissionLanguage)) return submissionLanguage;
  return allowed[0];
};

const buildSourceCode = (practical, solutionCode, language) => {
  const template = practical.starterTemplate?.[language];
  if (template?.prefix || template?.suffix) {
    return `${template.prefix || ""}\n${solutionCode}\n${template.suffix || ""}`;
  }
  return solutionCode;
};

const evaluate = async (practical, solutionCode, language, publicOnly) => {
  const sourceCode = buildSourceCode(practical, solutionCode, language);
  const testCases = practical.testCases.filter(
    (test) => !publicOnly || test.visibility === "public",
  );
  if (!testCases.length) throw new Error("No test cases are configured");
  const results = await runJudge0Cases({
    sourceCode,
    language,
    testCases,
    execution: practical.execution,
  });
  return {
    testCases,
    results: results.map((result, index) => ({
      ...result,
      expected: testCases[index].expected,
    })),
  };
};

const runTeacherSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission)
      return res.status(404).json({ error: "Submission not found" });
    const practical = await Practical.findById(submission.practicalId);
    if (!practical)
      return res.status(404).json({ error: "Practical not found" });
    req.practical = practical;
    return loadPracticalLab(req, res, (loadError) => {
      if (loadError) return next(loadError);
      return requireLabAccess("manage")(req, res, async (accessError) => {
        if (accessError) return next(accessError);
        const language = resolveLanguage(practical, submission.language);
        const sourceCode = buildSourceCode(
          practical,
          submission.code,
          language,
        );
        const execution = practical.execution?.enabled
          ? practical.execution
          : { timeLimitSeconds: 5, memoryLimitKb: 128000 };

        if (practical.testCases?.length) {
          const { testCases, results } = await evaluate(
            practical,
            submission.code,
            language,
            false,
          );
          return res.json({
            mode: "tests",
            language,
            results: results.map((result, index) => ({
              ...result,
              input: testCases[index].input,
              expected: testCases[index].expected,
              visibility: testCases[index].visibility,
            })),
          });
        }

        const output = await runJudge0Simple({
          sourceCode,
          language,
          execution,
        });
        res.json({ mode: "simple", language, output });
      });
    });
  } catch (error) {
    next(error);
  }
};

router.post(
  "/submission/:submissionId/run",
  authMiddleware,
  runTeacherSubmission,
);

// router.post(
//   "/:practicalId/run",
//   authMiddleware,
//   loadPractical,
//   loadPracticalLab,
//   requireLabAccess("view"),
//   async (req, res, next) => {
//     try {
//       const { solutionCode, language = "python" } = req.body;
//       if (
//         typeof solutionCode !== "string" ||
//         solutionCode.length > MAX_SOURCE_LENGTH
//       )
//         return res.status(400).json({ error: "Invalid solution code" });
//       if (!req.practical.execution.enabled)
//         return res
//           .status(400)
//           .json({ error: "Execution is disabled for this practical" });
//       if (!req.practical.execution.allowedLanguages.includes(language))
//         return res.status(400).json({ error: "Language is not allowed" });
//       const { testCases, results } = await evaluate(
//         req.practical,
//         solutionCode,
//         language,
//         true,
//       );
//       res.json({ results: exposeResults(results, testCases) });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

router.post(
  "/:practicalId/run",
  authMiddleware,
  loadPractical,
  loadPracticalLab,
  requireLabAccess("view"),
  async (req, res, next) => {
    try {
      const { solutionCode, language = "python", customStdin } = req.body;

      // Validation (same as before)
      if (
        typeof solutionCode !== "string" ||
        solutionCode.length > MAX_SOURCE_LENGTH
      )
        return res.status(400).json({ error: "Invalid solution code" });
      if (!req.practical.execution.enabled)
        return res
          .status(400)
          .json({ error: "Execution is disabled for this practical" });
      if (!req.practical.execution.allowedLanguages.includes(language))
        return res.status(400).json({ error: "Language is not allowed" });

      const sourceCode = buildSourceCode(req.practical, solutionCode, language);

      if (req.query.offline === "1") {
        if (customStdin !== undefined && customStdin !== null && customStdin.trim() !== "") {
          const output = await runLocalExecution({
            sourceCode,
            language,
            stdin: String(customStdin).trim(),
            timeLimitSeconds: req.practical.execution.timeLimitSeconds,
          });
          return res.json({
            mode: "custom",
            output: { stdout: output.stdout, stderr: output.stderr },
          });
        }
        const results = await runLocalCases({
          practical: req.practical,
          sourceCode,
          language,
        });
        return res.json({ results });
      }

      // ── NEW: custom input branch ──
      if (
        customStdin !== undefined &&
        customStdin !== null &&
        customStdin.trim() !== ""
      ) {
        const output = await runJudge0Simple({
          sourceCode,
          language,
          stdin: String(customStdin).trim(),
          execution: req.practical.execution,
        });
        return res.json({ mode: "custom", output });
      }

      // ── public tests branch (existing code) ──
      const { testCases, results } = await evaluate(
        req.practical,
        solutionCode,
        language,
        true,
      );
      res.json({ results: exposeResults(results, testCases) });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/:practicalId/submit",
  authMiddleware,
  loadPractical,
  loadPracticalLab,
  requireLabAccess("submit"),
  async (req, res, next) => {
    try {
      const { solutionCode, language = "python", idempotencyKey } = req.body;
      if (
        typeof solutionCode !== "string" ||
        solutionCode.length > MAX_SOURCE_LENGTH
      )
        return res.status(400).json({ error: "Invalid solution code" });
      if (!req.practical.execution.enabled)
        return res
          .status(400)
          .json({ error: "Execution is disabled for this practical" });
      if (!req.practical.execution.allowedLanguages.includes(language))
        return res.status(400).json({ error: "Language is not allowed" });
      if (idempotencyKey) {
        const existing = await Submission.findOne({
          idempotencyKey,
          studentId: req.user.id,
        });
        if (existing)
          return res.json({ submission: existing, duplicate: true });
      }
      const { testCases, results } = await evaluate(
        req.practical,
        solutionCode,
        language,
        false,
      );
      const totalWeight = testCases.reduce(
        (sum, test) => sum + (test.weight || 1),
        0,
      );
      const passedWeight = results.reduce(
        (sum, result) => sum + (result.passed ? result.weight : 0),
        0,
      );
      const submission = await Submission.create({
        studentId: req.user.id,
        practicalId: req.practical._id,
        code: solutionCode,
        language,
        status: "submitted",
        submittedAt: new Date(),
        score: totalWeight ? Math.round((passedWeight / totalWeight) * 100) : 0,
        testSummary: {
          passed: results.filter((result) => result.passed).length,
          total: results.length,
        },
        testResults: results.map(({ weight, ...result }) => result),
        idempotencyKey,
      });
      res
        .status(201)
        .json({ submission, results: exposeResults(results, testCases) });
    } catch (error) {
      next(error);
    }
  },
);

// Legacy submission endpoint: keeps manually reviewed practicals working.
router.post(
  "/",
  authMiddleware,
  loadPractical,
  loadPracticalLab,
  requireLabAccess("submit"),
  async (req, res, next) => {
    try {
      const { code, language = "python" } = req.body;
      if (typeof code !== "string" || code.length > MAX_SOURCE_LENGTH)
        return res.status(400).json({ error: "Invalid code" });
      const submission = await Submission.findOneAndUpdate(
        { studentId: req.user.id, practicalId: req.practical._id },
        { code, language, status: "submitted", submittedAt: new Date() },
        { upsert: true, new: true, runValidators: true },
      );
      res.json(submission);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/my/:practicalId",
  authMiddleware,
  loadPractical,
  loadPracticalLab,
  // requireLabAccess("view"),
  async (req, res, next) => {
    try {
      // console.log("Student ID:", req.user.id);
      // console.log("Practical ID:", req.practical._id);

      const submission = await Submission.findOne({
        studentId: req.user.id,
        practicalId: req.practical._id,
      }).sort({ updatedAt: -1 });

      // console.log("Found submission:", submission ? "Yes" : "No");

      const evaluation = submission
        ? await Evaluation.findOne({ submissionId: submission._id })
        : null;

      // console.log("Evaluation found:", evaluation ? "Yes" : "No");

      res.json({ submission, evaluation });
    } catch (error) {
      console.error("Error in /my/:practicalId:", error);
      next(error);
    }
  },
);

router.get("/my", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== "student")
      return res.status(403).json({ error: "Student access required" });
    const submissions = await Submission.find({
      studentId: req.user.id,
    }).populate("practicalId", "title deadline labId");
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

router.get("/lab/:labId", authMiddleware, async (req, res, next) => {
  try {
    const practicals = await Practical.find({ labId: req.params.labId });
    if (!practicals.length) return res.json([]);
    req.practical = practicals[0];
    return loadPracticalLab(req, res, (loadError) => {
      if (loadError) return next(loadError);
      return requireLabAccess("manage")(req, res, async (accessError) => {
        if (accessError) return next(accessError);

        // Get the most recent submission per (student, practical)
        const submissions = await Submission.aggregate([
          {
            $match: {
              practicalId: { $in: practicals.map((p) => p._id) },
            },
          },
          { $sort: { createdAt: -1 } }, // newest first
          {
            $group: {
              _id: {
                studentId: "$studentId",
                practicalId: "$practicalId",
              },
              doc: { $first: "$$ROOT" }, // take the first (newest) document
            },
          },
          { $replaceRoot: { newRoot: "$doc" } }, // flatten the document
        ]);

        // Populate student and practical details
        const populated = await Submission.populate(submissions, [
          { path: "studentId", select: "fullName rollNumber" },
          { path: "practicalId", select: "title" },
        ]);

        res.json(populated);
      });
    });
  } catch (error) {
    next(error);
  }
});

export default router;
