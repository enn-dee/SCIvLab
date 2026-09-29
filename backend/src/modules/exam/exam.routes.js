import express from "express";
import Exam from "../../models/Exam.js";
import ExamSubmission from "../../models/ExamSubmission.js";
import ExamPenalty from "../../models/ExamPenalty.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/roles.js";
import User from "../../models/User.js";

const router = express.Router();
const MAX_SOURCE_LENGTH = 100_000;
const teacherExam = (req, res, next) => {
  if (!req.exam || String(req.exam.teacherId) !== String(req.user.id)) {
    return res.status(403).json({ error: "You do not manage this exam" });
  }
  next();
};
const loadExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    req.exam = exam;
    next();
  } catch (error) { next(error); }
};
const pick = (body) => ({
  title: body.title,
  description: body.description || "",
  instructions: body.instructions || "",
  language: ["python", "cpp", "c", "java"].includes(body.language) ? body.language : "python",
  startTime: body.startTime || null,
  endTime: body.endTime || null,
  status: body.status === "draft" ? "draft" : "published",
});
const examWindow = (exam) => {
  const start = exam.startTime ? new Date(exam.startTime) : null;
  const configuredEnd = exam.endTime ? new Date(exam.endTime) : null;
  return { start, end: configuredEnd };
};
const requireExamAccess = (req, res) => {
  if (!req.exam.enrolledStudentIds.some((studentId) => String(studentId) === String(req.user.id))) {
    res.status(403).json({ error: "You are not enrolled in this exam" });
    return false;
  }
  return true;
};
const requireExamWindow = (req, res, { allowAutoSubmit = false } = {}) => {
  const { start, end } = examWindow(req.exam);
  const now = new Date();
  if (start && now < start) {
    res.status(403).json({ error: "This exam has not started yet", startsAt: start.toISOString() });
    return false;
  }
  const autoSubmitGraceEndsAt = end && new Date(end.getTime() + 10 * 1000);
  if (end && now >= end && !(allowAutoSubmit && now <= autoSubmitGraceEndsAt)) {
    res.status(403).json({ error: "The exam window has ended", endedAt: end.toISOString() });
    return false;
  }
  return true;
};
const requireExamStarted = (req, res) => {
  const start = req.exam.startTime ? new Date(req.exam.startTime) : null;
  if (start && new Date() < start) {
    res.status(403).json({
      error: "This exam is not available to view yet",
      startsAt: start.toISOString(),
    });
    return false;
  }
  return true;
};

router.get("/teacher", authMiddleware, requireRoles("teacher"), async (req, res, next) => {
  try { res.json(await Exam.find({ teacherId: req.user.id }).sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});

router.get("/teacher/submissions", authMiddleware, requireRoles("teacher"), async (req, res, next) => {
  try {
    const exams = await Exam.find({ teacherId: req.user.id }).select("_id title");
    const examIds = exams.map((exam) => exam._id);
    const [submissions, penalties] = await Promise.all([
      ExamSubmission.find({ examId: { $in: examIds } })
      .populate("studentId", "fullName rollNumber registrationNumber")
      .populate("examId", "title")
      .sort({ submittedAt: -1 }),
      ExamPenalty.find({ examId: { $in: examIds } }).select("studentId examId windowChangeCount fullscreenExitCount"),
    ]);
    const penaltyByStudentExam = new Map(
      penalties.map((penalty) => [`${penalty.examId}:${penalty.studentId}`, penalty]),
    );
    res.json(submissions.map((submission) => ({
      ...submission.toObject(),
      penalties: penaltyByStudentExam.get(`${submission.examId._id}:${submission.studentId._id}`) || null,
    })));
  } catch (error) { next(error); }
});

router.get("/student", authMiddleware, requireRoles("student"), async (req, res, next) => {
  try {
    const exams = await Exam.find({ status: "published", enrolledStudentIds: req.user.id }).populate("teacherId", "fullName").sort({ createdAt: -1 });
    const submissions = await ExamSubmission.find({ studentId: req.user.id }).select("examId submittedAt");
    const byExam = new Map(submissions.map((submission) => [String(submission.examId), submission]));
    res.json(exams.map((exam) => ({
      ...exam.toObject(),
      submission: byExam.get(String(exam._id)) || null,
    })));
  } catch (error) { next(error); }
});

router.post("/", authMiddleware, requireRoles("teacher"), async (req, res, next) => {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ error: "title is required" });
    if (!req.body.startTime || !req.body.endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }
    if (req.body.startTime && req.body.endTime && new Date(req.body.endTime) <= new Date(req.body.startTime)) {
      return res.status(400).json({ error: "endTime must be after startTime" });
    }
    res.status(201).json(await Exam.create({ ...pick(req.body), teacherId: req.user.id }));
  } catch (error) { next(error); }
});

router.get("/:id/students", authMiddleware, requireRoles("teacher"), loadExam, teacherExam, async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).select("fullName rollNumber registrationNumber batch branch").sort({ fullName: 1 });
    const enrolled = new Set(req.exam.enrolledStudentIds.map((id) => String(id)));
    res.json(students.map((student) => ({ ...student.toObject(), enrolled: enrolled.has(String(student._id)) })));
  } catch (error) { next(error); }
});

router.put("/:id/students", authMiddleware, requireRoles("teacher"), loadExam, teacherExam, async (req, res, next) => {
  try {
    const studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds : [];
    const validStudents = await User.find({ _id: { $in: studentIds }, role: "student" }).select("_id");
    req.exam.enrolledStudentIds = validStudents.map((student) => student._id);
    await req.exam.save();
    res.json({ enrolledStudentIds: req.exam.enrolledStudentIds });
  } catch (error) { next(error); }
});

router.get("/:id", authMiddleware, loadExam, async (req, res, next) => {
  try {
    if (req.user.role === "teacher" && String(req.exam.teacherId) !== String(req.user.id)) {
      return res.status(403).json({ error: "You do not manage this exam" });
    }
    if (req.user.role === "student" && req.exam.status !== "published") {
      return res.status(404).json({ error: "Exam not found" });
    }
    if (req.user.role === "student" && !requireExamAccess(req, res)) return;
    if (req.user.role === "student" && !requireExamStarted(req, res)) return;
    const data = req.exam.toObject();
    res.json(data);
  } catch (error) { next(error); }
});

router.put("/:id", authMiddleware, requireRoles("teacher"), loadExam, teacherExam, async (req, res, next) => {
  try {
    if (req.body.startTime && req.body.endTime && new Date(req.body.endTime) <= new Date(req.body.startTime)) {
      return res.status(400).json({ error: "endTime must be after startTime" });
    }
    res.json(await Exam.findByIdAndUpdate(req.exam._id, pick(req.body), { new: true, runValidators: true }));
  }
  catch (error) { next(error); }
});

router.delete("/:id", authMiddleware, requireRoles("teacher"), loadExam, teacherExam, async (req, res, next) => {
  try {
    await Exam.findByIdAndDelete(req.exam._id);
    await ExamSubmission.deleteMany({ examId: req.exam._id });
    res.status(204).send();
  } catch (error) { next(error); }
});

router.get("/:id/submission", authMiddleware, requireRoles("student"), loadExam, async (req, res, next) => {
  try {
    if (!requireExamAccess(req, res)) return;
    const [submission, penalties] = await Promise.all([
      ExamSubmission.findOne({ examId: req.exam._id, studentId: req.user.id }),
      ExamPenalty.findOne({ examId: req.exam._id, studentId: req.user.id })
        .select("windowChangeCount fullscreenExitCount"),
    ]);
    res.json({ submission, penalties });
  }
  catch (error) { next(error); }
});

router.post("/:id/penalties", authMiddleware, requireRoles("student"), loadExam, async (req, res, next) => {
  try {
    if (req.exam.status !== "published" || !requireExamAccess(req, res)) return;
    const penaltyField = {
      windowChange: "windowChangeCount",
      fullscreenExit: "fullscreenExitCount",
    }[req.body.type];
    if (!penaltyField) return res.status(400).json({ error: "Invalid penalty type" });
    const penalty = await ExamPenalty.findOneAndUpdate(
      { examId: req.exam._id, studentId: req.user.id },
      { $inc: { [penaltyField]: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    res.status(201).json({ penalties: penalty });
  } catch (error) { next(error); }
});

router.get("/:id/submissions", authMiddleware, requireRoles("teacher"), loadExam, teacherExam, async (req, res, next) => {
  try {
    const submissions = await ExamSubmission.find({ examId: req.exam._id })
      .populate("studentId", "fullName rollNumber registrationNumber")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) { next(error); }
});

router.post("/:id/submit", authMiddleware, requireRoles("student"), loadExam, async (req, res, next) => {
  try {
    if (req.exam.status !== "published") return res.status(404).json({ error: "Exam not found" });
    const { autoSubmit = false } = req.body;
    if (!requireExamAccess(req, res) || !requireExamWindow(req, res, { allowAutoSubmit: autoSubmit === true })) return;
    const { solutionCode } = req.body;
    const language = req.exam.language || "python";
    if (typeof solutionCode !== "string" || solutionCode.length > MAX_SOURCE_LENGTH) return res.status(400).json({ error: "Invalid solution code" });
    const submission = await ExamSubmission.findOneAndUpdate(
      { examId: req.exam._id, studentId: req.user.id },
      { code: solutionCode, language, submittedAt: new Date(), status: "submitted" },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json({ submission });
  } catch (error) { next(error); }
});

export default router;
