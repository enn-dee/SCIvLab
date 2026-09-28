import mongoose from "mongoose";
import Lab from "../models/Lab.js";
import Enrollment from "../models/Enrollment.js";
import LabTeacherAssignment from "../models/LabTeacherAssignment.js";
import { getTestWeek, isPracticalWeekOpen } from "../utils/practicalSchedule.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const loadLab = async (req, res, next) => {
  try {
    const labId = req.params.labId || req.params.id || req.body.labId;
    if (!isValidId(labId)) return res.status(400).json({ error: "Invalid lab id" });
    const lab = await Lab.findById(labId);
    if (!lab) return res.status(404).json({ error: "Lab not found" });
    req.lab = lab;
    next();
  } catch (error) {
    next(error);
  }
};

export const loadPracticalLab = async (req, res, next) => {
  try {
    const practical = req.practical;
    if (!practical) return res.status(500).json({ error: "Practical was not loaded" });
    const lab = await Lab.findById(practical.labId);
    if (!lab) return res.status(404).json({ error: "Lab not found" });
    req.lab = lab;
    next();
  } catch (error) {
    next(error);
  }
};

const teacherCanManage = async (teacherId, lab) => {
  // `teacherId` preserves access to pre-migration private labs.
  if (lab.kind === "academic") return true;
  if (lab.kind === "private" || !lab.kind) {
    return String(lab.ownerTeacherId || lab.teacherId) === String(teacherId);
  }
  return Boolean(await LabTeacherAssignment.exists({ labId: lab._id, teacherId, active: true }));
};

export const requireLabAccess = (action) => async (req, res, next) => {
  try {
    const { id, role } = req.user;
    if (role === "admin") return next();

    if (role === "teacher" && await teacherCanManage(id, req.lab)) return next();

    if (role === "student" && ["view", "submit"].includes(action)) {
      // Shared academic labs are the fixed curriculum catalogue: every student
      // may read them. Enrolment is still required for any write/submission.
      if (action === "view" && req.lab.kind === "academic") return next();
      const enrolled = await Enrollment.exists({ labId: req.lab._id, studentId: id, status: "active" });
      // Compatibility during migration: existing `students` array remains readable.
      const legacyEnrolled = req.lab.students.some((studentId) => String(studentId) === String(id));
      if (!enrolled && !legacyEnrolled) {
        return res.status(403).json({ error: "You are not enrolled in this lab" });
      }
      const deadline = req.practical?.deadline || req.lab.deadline;
      if (action === "submit" && deadline && new Date() > new Date(deadline) && !req.lab.rules?.lateSubmissionAllowed) {
        return res.status(403).json({ error: "The submission deadline has passed" });
      }
      if (action === "submit" && req.lab.kind === "academic" && req.practical) {
        const enrollmentRecord = await Enrollment.findOne({
          labId: req.lab._id,
          studentId: id,
          status: "active",
        }).select("createdAt");
        if (
          enrollmentRecord &&
          !isPracticalWeekOpen(
            req.practical,
            enrollmentRecord.createdAt,
            new Date(),
            getTestWeek(req),
          )
        ) {
          return res.status(403).json({ error: "This practical is not available for submission this week" });
        }
      }
      return next();
    }

    return res.status(403).json({ error: "Insufficient lab permission" });
  } catch (error) {
    next(error);
  }
};
