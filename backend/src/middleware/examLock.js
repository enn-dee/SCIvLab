import Exam from "../models/Exam.js";

const PRE_EXAM_BUFFER_MS = 60 * 60 * 1000;

export const restrictDuringExam = async (req, res, next) => {
  try {
    if (req.user.role !== "student") return next();

    const now = Date.now();
    const upcomingExam = await Exam.findOne({
      enrolledStudentIds: req.user.id,
      status: "published",
      startTime: { $ne: null },
      endTime: { $ne: null },
      startTime: { $lte: new Date(now + PRE_EXAM_BUFFER_MS) },
      endTime: { $gt: new Date(now) },
    })
      .select("title startTime endTime")
      .lean();

    if (upcomingExam) {
      return res.status(403).json({
        error: "Labs and algorithms are locked during exam hours",
        exam: upcomingExam,
        locked: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
