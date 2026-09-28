import express from "express";
import Lab from "../../models/Lab.js";
import User from "../../models/User.js";
import Enrollment from "../../models/Enrollment.js";
import { authMiddleware } from "../../middleware/auth.js";
import { loadLab, requireLabAccess } from "../../middleware/labAccess.js";

const router = express.Router();

const enrol = async (lab, student, enrolledBy) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { labId: lab._id, studentId: student._id },
    { enrolledBy, status: "active" },
    { upsert: true, new: true, runValidators: true }
  );
  // Keep legacy clients working while Enrollment becomes authoritative.
  if (!lab.students.some((id) => String(id) === String(student._id))) {
    lab.students.push(student._id);
    await lab.save();
  }
  return enrollment;
};

router.post(
  "/:labId/enroll",
  authMiddleware,
  loadLab,
  requireLabAccess("manage"),
  async (req, res, next) => {
    try {
      const rollNumber = req.body.rollNumber?.trim().toUpperCase();
      if (!rollNumber)
        return res.status(400).json({ error: "rollNumber is required" });
      const student = await User.findOne({ rollNumber, role: "student" });
      if (!student) return res.status(404).json({ error: "Student not found" });
      const enrollment = await enrol(req.lab, student, req.user.id);
      res.status(201).json({
        enrollment,
        student: {
          id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/:labId/bulk-enroll",
  authMiddleware,
  loadLab,
  requireLabAccess("manage"),
  async (req, res, next) => {
    try {
      const rollNumbers = [
        ...new Set(
          (req.body.rollNumbers || [])
            .map((roll) => roll.trim().toUpperCase())
            .filter(Boolean)
        ),
      ];
      if (!rollNumbers.length)
        return res.status(400).json({ error: "rollNumbers is required" });
      const students = await User.find({
        role: "student",
        rollNumber: { $in: rollNumbers },
      });

      // concurrent enroll fix
      for (const student of students) {
        await enrol(req.lab, student, req.user.id);
      }
      // await Promise.all(
      //   students.map((student) => enrol(req.lab, student, req.user.id))
      // );

      res.json({
        enrolled: students.length,
        missing: rollNumbers.filter(
          (roll) => !students.some((student) => student.rollNumber === roll)
        ),
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:labId/remove/:studentId",
  authMiddleware,
  loadLab,
  requireLabAccess("manage"),
  async (req, res, next) => {
    try {
      await Enrollment.findOneAndUpdate(
        { labId: req.lab._id, studentId: req.params.studentId },
        { status: "withdrawn" }
      );
      req.lab.students = req.lab.students.filter(
        (id) => String(id) !== req.params.studentId
      );
      await req.lab.save();
      // res.status(204).send();
      res.json({
        success: true,
        message: "Student removed",
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:labId",
  authMiddleware,
  loadLab,
  requireLabAccess("manage"),
  async (req, res, next) => {
    try {
      const enrollments = await Enrollment.find({
        labId: req.lab._id,
        status: "active",
      }).populate("studentId", "fullName rollNumber");
      // Legacy labs with no backfill still remain usable.
      if (!enrollments.length && req.lab.students.length) {
        const legacy = await Lab.findById(req.lab._id).populate(
          "students",
          "fullName rollNumber"
        );
        return res.json(legacy.students);
      }
      res.json(enrollments.map((item) => item.studentId));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
