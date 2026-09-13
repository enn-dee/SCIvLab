import express from "express";
import Lab from "../models/Lab.js";
import Enrollment from "../models/Enrollment.js";
import { authMiddleware } from "../middleware/auth.js";
import { loadLab, requireLabAccess } from "../middleware/labAccess.js"; // ← FIX: add .js extension

import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// ─── Helper: enroll student (reused from earlier) ──────────────────
const enrol = async (lab, student, enrolledBy) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { labId: lab._id, studentId: student._id },
    { enrolledBy, status: "active" },
    { upsert: true, new: true, runValidators: true },
  );
  // Keep legacy clients working while Enrollment becomes authoritative.
  if (!lab.students.some((id) => String(id) === String(student._id))) {
    lab.students.push(student._id);
    await lab.save();
  }
  return enrollment;
};

// ─── CSV import route ────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/:labId/import-csv",
  authMiddleware,
  loadLab,
  requireLabAccess("manage"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
      }

      const csvBuffer = req.file.buffer;
      const results = [];
      const errors = [];

      // Parse CSV
      const stream = Readable.from(csvBuffer.toString());
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", resolve)
          .on("error", reject);
      });

      // Process each row
      const enrolledStudents = [];
      for (const [index, row] of results.entries()) {
        const roll = row.rollNumber?.trim().toUpperCase();
        const reg = row.registrationNumber?.trim().toUpperCase();
        const fullName = row.fullName?.trim();
        const dob = row.dob?.trim(); // expected format: DDMMYYYY or DD-MM-YYYY etc.
        const batch = row.batch?.trim();
        const branch = row.branch?.trim();

        if (!roll || !fullName || !dob) {
          errors.push({
            row: index + 1,
            error: "Missing required fields (rollNumber, fullName, dob)",
          });
          continue;
        }

        // Normalise DOB to DDMMYYYY
        const cleanDob = dob.replace(/[^0-9]/g, "");
        if (cleanDob.length !== 8) {
          errors.push({
            row: index + 1,
            error: "DOB must be 8 digits (DDMMYYYY)",
          });
          continue;
        }
        const password = cleanDob; // e.g., "15032000"

        try {
          // Check if user already exists by rollNumber or registrationNumber
          let user = await User.findOne({
            $or: [{ rollNumber: roll }, { registrationNumber: reg }],
          });

          if (!user) {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
              fullName,
              rollNumber: roll,
              registrationNumber: reg || undefined,
              password: hashedPassword,
              role: "student",
              batch,
              branch,
            });
          } else {
            // Optionally update fields if they are missing
            if (!user.registrationNumber && reg) {
              user.registrationNumber = reg;
              await user.save();
            }
          }

          // Enrol into the lab using the helper
          await enrol(req.lab, user, req.user.id);
          enrolledStudents.push({ roll, registrationNumber: reg, fullName });
        } catch (err) {
          errors.push({ row: index + 1, error: err.message });
        }
      }

      res.status(201).json({
        success: true,
        enrolled: enrolledStudents.length,
        errors,
        enrolledStudents,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET labs where student is enrolled ─────────────────────────────
router.get("/labs", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;
    const enrollmentLabIds = (
      await Enrollment.find({ studentId, status: "active" }).select("labId")
    ).map((item) => item.labId);
    const labs = await Lab.find({
      $or: [
        { kind: "academic", status: "current" },
        { students: studentId },
        { _id: { $in: enrollmentLabIds } },
      ],
    }).populate("teacherId", "fullName email").populate("students", "_id");

    const activeEnrollments = await Enrollment.find({
      labId: { $in: labs.map((lab) => lab._id) },
      studentId,
      status: "active",
    }).select("labId");
    const enrolledLabIds = new Set(
      activeEnrollments.map((enrollment) => String(enrollment.labId)),
    );

    res.set("Cache-Control", "no-store");
    res.json(
      labs.map((lab) => {
        const data = lab.toObject();
        if (lab.kind === "academic") {
          data.isEnrolled =
            enrolledLabIds.has(String(lab._id)) ||
            lab.students.some(
              (student) =>
                String(student?._id || student?.id || student) ===
                String(req.user.id),
            );
        }
        return data;
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
