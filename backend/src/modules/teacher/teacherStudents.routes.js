import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

import User from "../../models/User.js";
import Enrollment from "../../models/Enrollment.js";
import { authMiddleware } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/roles.js";

const router = express.Router();

// ─── Multer for CSV upload ──────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ─── GET all students (with optional filters) ──────────────────────
router.get(
  "/",
  authMiddleware,
  requireRoles("teacher"),
  async (req, res, next) => {
    try {
      const { batch, branch, search } = req.query;

      const filter = { role: "student" };
      if (batch) filter.batch = batch;
      if (branch) filter.branch = branch;
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
          { registrationNumber: { $regex: search, $options: "i" } },
        ];
      }

      const students = await User.find(filter)
        .select("-password")
        .sort({ fullName: 1 });
      res.json(students);
    } catch (error) {
      next(error);
    }
  },
);

// ─── IMPORT CSV (system‑wide, no lab enrollment) ────────────────────
router.post(
  "/import",
  authMiddleware,
  requireRoles("teacher"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
      }

      const results = [];
      const errors = [];

      // Parse CSV
      const stream = Readable.from(req.file.buffer.toString());
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", resolve)
          .on("error", reject);
      });

      const createdStudents = [];

      for (const [index, row] of results.entries()) {
        const roll = row.rollNumber?.trim().toUpperCase();
        const reg = row.registrationNumber?.trim().toUpperCase();
        const fullName = row.fullName?.trim();
        const dob = row.dob?.trim();
        const batch = row.batch?.trim();
        const branch = row.branch?.trim();

        if (!roll || !fullName || !dob) {
          errors.push({
            row: index + 1,
            error: "Missing required fields (rollNumber, fullName, dob)",
          });
          continue;
        }

        const cleanDob = dob.replace(/[^0-9]/g, "");
        if (cleanDob.length !== 8) {
          errors.push({
            row: index + 1,
            error: "DOB must be 8 digits (DDMMYYYY)",
          });
          continue;
        }

        const password = cleanDob;

        try {
          // Check if user already exists
          let user = await User.findOne({
            $or: [{ rollNumber: roll }, { registrationNumber: reg }],
          });

          if (!user) {
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
            // Update missing fields if needed
            if (!user.registrationNumber && reg) {
              user.registrationNumber = reg;
              await user.save();
            }
            if (!user.batch && batch) {
              user.batch = batch;
              await user.save();
            }
            if (!user.branch && branch) {
              user.branch = branch;
              await user.save();
            }
          }

          createdStudents.push({
            roll,
            registrationNumber: reg,
            fullName,
            batch,
            branch,
          });
        } catch (err) {
          errors.push({ row: index + 1, error: err.message });
        }
      }

      res.status(201).json({
        success: true,
        created: createdStudents.length,
        errors,
        students: createdStudents,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── DELETE single student ──────────────────────────────────────────
router.delete(
  "/:id",
  authMiddleware,
  requireRoles("teacher"),
  async (req, res, next) => {
    try {
      const student = await User.findOneAndDelete({
        _id: req.params.id,
        role: "student",
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Clean up enrollments
      await Enrollment.deleteMany({ studentId: student._id });

      res.json({ success: true, message: "Student deleted" });
    } catch (error) {
      next(error);
    }
  },
);

// ─── BULK DELETE students ───────────────────────────────────────────
router.post(
  "/bulk-delete",
  authMiddleware,
  requireRoles("teacher"),
  async (req, res, next) => {
    try {
      const { studentIds } = req.body;
      if (!studentIds || !studentIds.length) {
        return res.status(400).json({ error: "studentIds array is required" });
      }

      const result = await User.deleteMany({
        _id: { $in: studentIds },
        role: "student",
      });

      // Clean up enrollments
      await Enrollment.deleteMany({ studentId: { $in: studentIds } });

      res.json({
        success: true,
        deleted: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET available batches & branches (for filters) ────────────────
router.get(
  "/metadata",
  authMiddleware,
  requireRoles("teacher"),
  async (req, res, next) => {
    try {
      const batches = await User.distinct("batch", { role: "student" });
      const branches = await User.distinct("branch", { role: "student" });
      res.json({
        batches: batches.filter(Boolean).sort(),
        branches: branches.filter(Boolean).sort(),
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
