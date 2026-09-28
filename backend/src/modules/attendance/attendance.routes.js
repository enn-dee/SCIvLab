import express from "express";
import Attendance from "../../models/Attendance.js";
import Lab from "../../models/Lab.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// MARK ATTENDANCE (SINGLE OR BULK)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { records } = req.body; // [{ studentId, labId, practicalId, date, type, status }]

    const attendanceRecords = await Promise.all(
      records.map(async (record) => {
        let att = await Attendance.findOne({
          studentId: record.studentId,
          date: record.date,
          type: record.type,
          labId: record.labId
        });

        if (att) {
          att.status = record.status;
          await att.save();
          return att;
        } else {
          return await Attendance.create(record);
        }
      })
    );

    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ATTENDANCE BY LAB AND DATE
router.get("/lab/:labId", authMiddleware, async (req, res) => {
  try {
    const { date, type } = req.query;
    const filter = { labId: req.params.labId };
    if (date) filter.date = new Date(date);
    if (type) filter.type = type;

    const attendance = await Attendance.find(filter)
      .populate("studentId", "fullName rollNumber");
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET STUDENT ATTENDANCE PERCENTAGE
router.get("/student/:studentId/:labId", authMiddleware, async (req, res) => {
  try {
    const records = await Attendance.find({
      studentId: req.params.studentId,
      labId: req.params.labId
    });

    const total = records.length;
    const present = records.filter(r => r.status === "present").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ total, present, absent: total - present, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET LOW ATTENDANCE ALERTS
router.get("/low-attendance/:labId", authMiddleware, async (req, res) => {
  try {
    const threshold = req.query.threshold || 75;
    const lab = await Lab.findById(req.params.labId).populate("students", "fullName rollNumber");
    if (!lab) return res.status(404).json({ msg: "Lab not found" });

    const alerts = [];

    for (const student of lab.students) {
      const records = await Attendance.find({
        studentId: student._id,
        labId: req.params.labId
      });

      const total = records.length;
      const present = records.filter(r => r.status === "present").length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

      if (percentage < threshold) {
        alerts.push({
          student: { id: student._id, fullName: student.fullName, rollNumber: student.rollNumber },
          percentage,
          total,
          present
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;