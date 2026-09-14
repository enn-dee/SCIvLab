import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";

import SuperAdmin from "../models/SuperAdmin.js";
import Teacher from "../models/Teacher.js";
import LabTeacherAssignment from "../models/LabTeacherAssignment.js";
import Lab from "../models/Lab.js";
import Practical from "../models/Practical.js";
import Submission from "../models/Submission.js";
import Evaluation from "../models/Evaluation.js";
import Marks from "../models/Marks.js";
import Attendance from "../models/Attendance.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { superAdminOnly } from "../middleware/superAdmin.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ─── Cascade delete helper ─────────────────────────────────────────
const deleteTeacherCascade = async (teacherIds) => {
  const ids = Array.isArray(teacherIds) ? teacherIds : [teacherIds];

  // 1. Find all labs owned by these teachers
  const labs = await Lab.find({
    $or: [{ ownerTeacherId: { $in: ids } }, { teacherId: { $in: ids } }],
  }).select("_id");
  const labIds = labs.map((l) => l._id);

  // 2. Find all practicals in those labs
  const practicals = await Practical.find({ labId: { $in: labIds } }).select(
    "_id",
  );
  const practicalIds = practicals.map((p) => p._id);

  // 3. Find all submissions for those practicals
  const submissions = await Submission.find({
    practicalId: { $in: practicalIds },
  }).select("_id");
  const submissionIds = submissions.map((s) => s._id);

  // 4. Delete everything in parallel
  await Promise.all([
    // Data tied to submissions
    Submission.deleteMany({ practicalId: { $in: practicalIds } }),
    Evaluation.deleteMany({
      $or: [
        { submissionId: { $in: submissionIds } },
        { teacherId: { $in: ids } },
      ],
    }),

    // Data tied to labs / practicals
    Marks.deleteMany({ practicalId: { $in: practicalIds } }),
    Attendance.deleteMany({ labId: { $in: labIds } }),
    Enrollment.deleteMany({ labId: { $in: labIds } }),
    Practical.deleteMany({ labId: { $in: labIds } }),

    // Lab itself + teacher assignments
    Lab.deleteMany({ _id: { $in: labIds } }),
    LabTeacherAssignment.deleteMany({ teacherId: { $in: ids } }),

    // Finally the teacher accounts
    Teacher.deleteMany({ _id: { $in: ids } }),
  ]);

  return {
    teachers: ids.length,
    labs: labIds.length,
    practicals: practicalIds.length,
    submissions: submissionIds.length,
  };
};

// ─── LOGIN ─────────────────────────────────────────────────────────
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "superadmin" },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      role: "superadmin",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── LIST TEACHERS ─────────────────────────────────────────────────
router.get(
  "/teachers",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const { search, department } = req.query;
      const filter = {};
      if (department) filter.department = department;
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      const teachers = await Teacher.find(filter)
        .select("-password")
        .sort({ fullName: 1 });
      res.json(teachers);
    } catch (err) {
      next(err);
    }
  },
);

// ─── CREATE SINGLE TEACHER ─────────────────────────────────────────
router.post(
  "/teachers",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const { fullName, email, password, department } = req.body;
      if (!fullName || !email || !password) {
        return res
          .status(400)
          .json({ msg: "fullName, email and password required" });
      }

      const existing = await Teacher.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ msg: "Teacher already exists" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const teacher = await Teacher.create({
        fullName,
        email: email.toLowerCase(),
        password: hashed,
        department: department || "",
      });

      res.status(201).json({
        _id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        department: teacher.department,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── BULK IMPORT TEACHERS (CSV) ────────────────────────────────────
// CSV headers: fullName,email,password,department
router.post(
  "/teachers/import",
  authMiddleware,
  superAdminOnly,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "CSV file is required" });

      const results = [];
      const errors = [];
      const stream = Readable.from(req.file.buffer.toString());

      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", resolve)
          .on("error", reject);
      });

      const created = [];
      for (const [index, row] of results.entries()) {
        const fullName = row.fullName?.trim();
        const email = row.email?.trim().toLowerCase();
        const password = row.password?.trim();
        const department = row.department?.trim() || "";

        if (!fullName || !email || !password) {
          errors.push({
            row: index + 1,
            error: "Missing required fields (fullName, email, password)",
          });
          continue;
        }
        if (password.length < 6) {
          errors.push({ row: index + 1, error: "Password must be ≥ 6 chars" });
          continue;
        }

        try {
          const existing = await Teacher.findOne({ email });
          if (existing) {
            errors.push({
              row: index + 1,
              error: `Email already exists: ${email}`,
            });
            continue;
          }
          const hashed = await bcrypt.hash(password, 10);
          const teacher = await Teacher.create({
            fullName,
            email,
            password: hashed,
            department,
          });
          created.push({ fullName, email, department });
        } catch (err) {
          errors.push({ row: index + 1, error: err.message });
        }
      }

      res.status(201).json({
        success: true,
        created: created.length,
        errors,
        teachers: created,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── DELETE SINGLE TEACHER (cascade) ───────────────────────────────
router.delete(
  "/teachers/:id",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });

      const summary = await deleteTeacherCascade(teacher._id);

      res.json({
        success: true,
        message: "Teacher and all associated data deleted",
        deleted: summary,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── BULK DELETE TEACHERS (cascade) ────────────────────────────────
router.post(
  "/teachers/bulk-delete",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const { teacherIds } = req.body;
      if (!teacherIds || !teacherIds.length) {
        return res.status(400).json({ error: "teacherIds array is required" });
      }

      const summary = await deleteTeacherCascade(teacherIds);

      res.json({
        success: true,
        message: "Teachers and all associated data deleted",
        deleted: summary,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── METADATA (departments for filters) ────────────────────────────
router.get(
  "/teachers/metadata",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const departments = await Teacher.distinct("department");
      res.json({ departments: departments.filter(Boolean).sort() });
    } catch (err) {
      next(err);
    }
  },
);

// ─── SUPER ADMIN ANALYTICS ────────────────────────────────────────
router.get(
  "/analytics",
  authMiddleware,
  superAdminOnly,
  async (req, res, next) => {
    try {
      const [teachers, labs, practicals, submissions, students] =
        await Promise.all([
          Teacher.find().select("fullName email department createdAt").lean(),
          Lab.find()
            .select(
              "_id name subjectCode kind status teacherId ownerTeacherId students createdAt",
            )
            .lean(),
          Practical.find().select("_id labId title").lean(),
          Submission.find()
            .select("_id studentId practicalId submittedAt")
            .lean(),
          User.find({ role: "student" })
            .select("_id fullName rollNumber batch branch")
            .lean(),
        ]);

      // ── Map teacher → their labs ──
      const teacherLabMap = {};
      teachers.forEach((t) => {
        teacherLabMap[String(t._id)] = [];
      });

      labs.forEach((lab) => {
        const owner = lab.ownerTeacherId || lab.teacherId;
        if (owner && teacherLabMap[String(owner)]) {
          teacherLabMap[String(owner)].push(lab);
        }
      });

      // ── Per-teacher stats ──
      const teacherStats = teachers.map((t) => {
        const myLabs = teacherLabMap[String(t._id)] || [];
        const myLabIds = new Set(myLabs.map((l) => String(l._id)));
        const myPracticals = practicals.filter((p) =>
          myLabIds.has(String(p.labId)),
        );
        const myPracIds = new Set(myPracticals.map((p) => String(p._id)));
        const mySubmissions = submissions.filter((s) =>
          myPracIds.has(String(s.practicalId)),
        );

        const studentSet = new Set();
        myLabs.forEach((lab) => {
          (lab.students || []).forEach((sid) => studentSet.add(String(sid)));
        });

        const expected = studentSet.size * myPracticals.length;
        const completion = expected
          ? Math.round((mySubmissions.length / expected) * 100)
          : 0;

        return {
          id: t._id,
          fullName: t.fullName,
          email: t.email,
          department: t.department || "Unassigned",
          labs: myLabs.length,
          activeLabs: myLabs.filter((l) => l.status === "current").length,
          students: studentSet.size,
          practicals: myPracticals.length,
          submissions: mySubmissions.length,
          completion,
        };
      });

      // ── Summary ──
      const summary = {
        totalTeachers: teachers.length,
        totalLabs: labs.length,
        totalStudents: students.length,
        totalPracticals: practicals.length,
        totalSubmissions: submissions.length,
      };

      // ── Department distribution ──
      const deptMap = {};
      teacherStats.forEach((t) => {
        if (!deptMap[t.department])
          deptMap[t.department] = {
            name: t.department,
            teachers: 0,
            labs: 0,
            students: 0,
          };
        deptMap[t.department].teachers++;
        deptMap[t.department].labs += t.labs;
        deptMap[t.department].students += t.students;
      });
      const departments = Object.values(deptMap).sort(
        (a, b) => b.teachers - a.teachers,
      );

      // ── Top professors by student count ──
      const topByStudents = [...teacherStats]
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);

      // ── Inactive teachers (0 labs or 0 submissions) ──
      const inactiveTeachers = teacherStats
        .filter((t) => t.labs === 0 || t.submissions === 0)
        .sort((a, b) => a.submissions - b.submissions)
        .slice(0, 6);

      // ── Submission activity (last 7 days) ──
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

      // ── Labs per department ──
      const labKindBreakdown = [
        {
          name: "Academic",
          value: labs.filter((l) => l.kind === "academic").length,
        },
        {
          name: "Private",
          value: labs.filter((l) => l.kind === "private").length,
        },
      ];

      res.json({
        summary,
        teacherStats,
        departments,
        topByStudents,
        inactiveTeachers,
        submissionActivity,
        labKindBreakdown,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
