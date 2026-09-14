import express from "express";
import Lab from "../models/Lab.js";
import Practical from "../models/Practical.js";
import Submission from "../models/Submission.js";
import Marks from "../models/Marks.js";
import Attendance from "../models/Attendance.js";
import Evaluation from "../models/Evaluation.js";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ─── STUDENT PERFORMANCE REPORT (distinct practicals) ────────────────
router.get("/student-performance/:labId", authMiddleware, async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.labId).populate(
      "students",
      "fullName rollNumber",
    );
    if (!lab) return res.status(404).json({ msg: "Lab not found" });

    const practicals = await Practical.find({ labId: req.params.labId });
    const practicalIds = practicals.map((p) => p._id);

    const report = [];

    for (const student of lab.students) {
      // Find all submissions for this student in this lab
      const submissions = await Submission.find({
        studentId: student._id,
        practicalId: { $in: practicalIds },
      });

      // Track distinct practical IDs that have an approved evaluation
      const approvedPracticalIds = new Set();

      for (const sub of submissions) {
        const evalDoc = await Evaluation.findOne({ submissionId: sub._id });
        if (evalDoc && evalDoc.status === "approved") {
          approvedPracticalIds.add(sub.practicalId.toString());
        }
      }

      const completedCount = approvedPracticalIds.size;

      // (Optional) Sum of marks from the latest approved submission – you can adjust later
      let totalMarks = 0;
      let marksCount = 0;
      // If you want to sum marks from approved submissions (deduplicated per practical)
      // you can fetch the latest approved submission for each practical and sum scores.

      // Attendance (unchanged)
      const attendanceRecords = await Attendance.find({
        studentId: student._id,
        labId: req.params.labId,
      });
      const present = attendanceRecords.filter(
        (r) => r.status === "present",
      ).length;
      const attendancePercent =
        attendanceRecords.length > 0
          ? Math.round((present / attendanceRecords.length) * 100)
          : 0;

      report.push({
        student: {
          id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
        },
        totalMarks, // optional, set to 0 or compute differently
        avgMarks: 0, // optional
        practicalsCompleted: completedCount,
        totalPracticals: practicals.length,
        attendancePercent,
      });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SUBMISSION REPORT
router.get("/submissions/:labId", authMiddleware, async (req, res) => {
  try {
    const practicals = await Practical.find({ labId: req.params.labId });
    const practicalIds = practicals.map((p) => p._id);

    const submissions = await Submission.find({
      practicalId: { $in: practicalIds },
    })
      .populate("studentId", "fullName rollNumber")
      .populate("practicalId", "title");

    const report = practicals.map((p) => {
      const subs = submissions.filter(
        (s) => s.practicalId._id.toString() === p._id.toString(),
      );
      return {
        practical: { id: p._id, title: p.title },
        submitted: subs.filter((s) => s.status === "submitted").length,
        late: subs.filter((s) => s.status === "late").length,
        pending: 0, // would need lab students count
        submissions: subs,
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARKS ANALYSIS REPORT
router.get("/marks-analysis/:labId", authMiddleware, async (req, res) => {
  try {
    const practicals = await Practical.find({ labId: req.params.labId });
    const practicalIds = practicals.map((p) => p._id);
    const allMarks = await Marks.find({ practicalId: { $in: practicalIds } });

    const analysis = practicals.map((p) => {
      const pMarks = allMarks.filter(
        (m) => m.practicalId.toString() === p._id.toString(),
      );
      const totals = pMarks.map((m) => m.total);
      return {
        practical: { id: p._id, title: p.title },
        highest: totals.length > 0 ? Math.max(...totals) : 0,
        lowest: totals.length > 0 ? Math.min(...totals) : 0,
        average:
          totals.length > 0
            ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2)
            : 0,
        submissions: totals.length,
      };
    });

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATTENDANCE SUMMARY REPORT
router.get("/attendance-summary/:labId", authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { labId: req.params.labId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter);

    const labCount = records.filter((r) => r.type === "lab").length;
    const lectureCount = records.filter((r) => r.type === "lecture").length;
    const labPresent = records.filter(
      (r) => r.type === "lab" && r.status === "present",
    ).length;
    const lecturePresent = records.filter(
      (r) => r.type === "lecture" && r.status === "present",
    ).length;

    res.json({
      totalRecords: records.length,
      lab: {
        total: labCount,
        present: labPresent,
        percentage:
          labCount > 0 ? Math.round((labPresent / labCount) * 100) : 0,
      },
      lecture: {
        total: lectureCount,
        present: lecturePresent,
        percentage:
          lectureCount > 0
            ? Math.round((lecturePresent / lectureCount) * 100)
            : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DASHBOARD STATS
router.get("/dashboard-stats", authMiddleware, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const labs = await Lab.find({ teacherId });
    const labIds = labs.map((l) => l._id);

    const totalStudents = labs.reduce((sum, l) => sum + l.students.length, 0);
    const totalPracticals = await Practical.countDocuments({
      labId: { $in: labIds },
    });
    const pendingEvaluations = await Evaluation.countDocuments({
      teacherId,
      status: "pending",
    });

    res.json({
      totalLabs: labs.length,
      currentLabs: labs.filter((l) => l.status === "current").length,
      totalStudents,
      totalPracticals,
      pendingEvaluations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEACHER ANALYTICS OVERVIEW ────────────────────────────────────
router.get("/teacher-overview", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Teacher access required" });
    }
    const teacherId = req.user.id;

    // ── Collect all labs this teacher can see ──
    const [ownedLabs, academicLabs] = await Promise.all([
      Lab.find({
        $or: [{ ownerTeacherId: teacherId }, { teacherId: teacherId }],
      }).lean(),
      Lab.find({ kind: "academic" }).lean(),
    ]);
    const labMap = new Map();
    [...ownedLabs, ...academicLabs].forEach((l) =>
      labMap.set(String(l._id), l),
    );
    const allLabs = Array.from(labMap.values());
    const labIds = allLabs.map((l) => l._id);

    // ── Unique students across all labs ──
    const allStudentIds = new Set();
    allLabs.forEach((lab) => {
      (lab.students || []).forEach((sid) => allStudentIds.add(String(sid)));
    });

    // ── Practicals + Submissions ──
    const practicals = await Practical.find({ labId: { $in: labIds } })
      .select("_id labId title")
      .lean();
    const practicalIds = practicals.map((p) => p._id);

    const submissions = await Submission.find({
      practicalId: { $in: practicalIds },
    })
      .select("_id studentId practicalId submittedAt status score")
      .lean();

    // ── Last 7 days submission activity ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const submissionActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = submissions.filter(
        (s) =>
          s.submittedAt &&
          new Date(s.submittedAt).toISOString().slice(0, 10) === key,
      ).length;
      submissionActivity.push({
        date: key,
        label: d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        count,
      });
    }

    // ── Attendance trend (last 30 days) ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attendanceRecords = await Attendance.find({
      labId: { $in: labIds },
      date: { $gte: thirtyDaysAgo },
    })
      .select("studentId date status")
      .lean();

    const attendanceByDay = {};
    attendanceRecords.forEach((r) => {
      const key = new Date(r.date).toISOString().slice(0, 10);
      if (!attendanceByDay[key])
        attendanceByDay[key] = { present: 0, total: 0 };
      attendanceByDay[key].total++;
      if (r.status === "present") attendanceByDay[key].present++;
    });
    const attendanceTrend = Object.entries(attendanceByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { present, total }]) => ({
        date,
        label: new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        percentage: total ? Math.round((present / total) * 100) : 0,
      }));

    // ── Pending evaluations ──
    const pendingEvaluations = await Evaluation.countDocuments({
      teacherId,
      status: "pending",
    });

    // ── Lab-wise breakdown ──
    const labBreakdown = allLabs.map((lab) => {
      const labPracticals = practicals.filter(
        (p) => String(p.labId) === String(lab._id),
      );
      const labPracIds = new Set(labPracticals.map((p) => String(p._id)));
      const labSubs = submissions.filter((s) =>
        labPracIds.has(String(s.practicalId)),
      );
      return {
        id: lab._id,
        name: lab.name,
        subjectCode: lab.subjectCode,
        students: (lab.students || []).length,
        practicals: labPracticals.length,
        submissions: labSubs.length,
      };
    });

    // ── Approved evaluations → per-student completion count ──
    const evaluations = await Evaluation.find({
      status: "approved",
      submissionId: { $in: submissions.map((s) => s._id) },
    })
      .populate({ path: "submissionId", select: "studentId practicalId" })
      .lean();

    const studentCompleted = {};
    evaluations.forEach((ev) => {
      const sid = ev.submissionId?.studentId;
      const pid = ev.submissionId?.practicalId;
      if (!sid || !pid) return;
      const key = String(sid);
      if (!studentCompleted[key]) studentCompleted[key] = new Set();
      studentCompleted[key].add(String(pid));
    });

    // ── Students info ──
    const students = await User.find({
      _id: { $in: Array.from(allStudentIds) },
    })
      .select("fullName rollNumber batch branch")
      .lean();

    // ── Average attendance per student ──
    const studentAttendance = {};
    attendanceRecords.forEach((r) => {
      const key = String(r.studentId);
      if (!studentAttendance[key])
        studentAttendance[key] = { present: 0, total: 0 };
      studentAttendance[key].total++;
      if (r.status === "present") studentAttendance[key].present++;
    });

    const studentStats = students.map((s) => {
      const att = studentAttendance[String(s._id)];
      const attendance =
        att && att.total ? Math.round((att.present / att.total) * 100) : null;
      return {
        id: s._id,
        fullName: s.fullName,
        rollNumber: s.rollNumber,
        batch: s.batch,
        branch: s.branch,
        attendance,
        completed: studentCompleted[String(s._id)]?.size || 0,
      };
    });

    const topStudents = [...studentStats]
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);

    const atRiskStudents = studentStats
      .filter((s) => s.attendance !== null && s.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance)
      .slice(0, 6);

    res.json({
      summary: {
        totalLabs: allLabs.length,
        activeLabs: allLabs.filter((l) => l.status === "current").length,
        totalStudents: allStudentIds.size,
        totalPracticals: practicals.length,
        totalSubmissions: submissions.length,
        pendingEvaluations,
      },
      submissionActivity,
      attendanceTrend,
      labBreakdown,
      topStudents,
      atRiskStudents,
    });
  } catch (err) {
    console.error("teacher-overview error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
