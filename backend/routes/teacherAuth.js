import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Teacher from "../models/Teacher.js";

dotenv.config();

const router = express.Router();

// REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { fullName, email, password, department } = req.body;

//     if (!fullName || !email || !password) {
//       return res.status(400).json({ msg: "Missing required fields" });
//     }

//     const existing = await Teacher.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ msg: "Teacher already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const teacher = await Teacher.create({
//       fullName,
//       email,
//       password: hashed,
//       department
//     });

//     const token = jwt.sign(
//       { id: teacher._id, role: "teacher" },
//       process.env.SECRET_KEY,
//       { expiresIn: "7d" }
//     );

//     res.json({ token, teacher: { id: teacher._id, fullName, email, department } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });
// TEACHER REGISTRATION DISABLED — accounts are created by super admin
router.post("/register", async (req, res) => {
  return res.status(403).json({
    msg: "Teacher registration is closed. Contact the administrator.",
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, teacher.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      teacher: {
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        department: teacher.department,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
