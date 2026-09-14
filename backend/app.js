import express from "express";
import cors from "cors";

import algorithmRoutes from "./routes/algorithm.js";
import algorithmSubmissionRoutes from "./routes/algorithmSubmission.js";
import authRoutes from "./routes/auth.js";
import practicalSubmissionRoutes from "./routes/PracticalSubmissions.js"; // Fixed import name
import adminRoutes from "./routes/admin.js";
import adminStudentsRoutes from "./routes/adminStudents.js";
import teacherAuthRoutes from "./routes/teacherAuth.js";
import labRoutes from "./routes/lab.js";
import studentRoutes from "./routes/students.js";
import practicalRoutes from "./routes/practical.js";
import evaluationRoutes from "./routes/evaluation.js";
import marksRoutes from "./routes/marks.js";
import attendanceRoutes from "./routes/attendance.js";
import reportRoutes from "./routes/reports.js";
import studentLabRoutes from "./routes/studentLab.js";
import progressRoute from "./routes/progress.js";
import adminLabRoutes from "./routes/adminLabs.js";
import assignmentRoutes from "./routes/assignments.js";
import teacherStudentsRoutes from "./routes/teacherStudents.js";
import superAdminRoutes from "./routes/superAdmin.js";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.url}`);
//   next();
// });

app.use(express.static(path.join(__dirname, "../frontend/dist")));

connectDB();

app.use("/api/algorithms", algorithmRoutes);
app.use("/api/algo-progress", algorithmSubmissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/submissions", practicalSubmissionRoutes);
app.use("/api/progress", progressRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/students", adminStudentsRoutes);
app.use("/api/admin/labs", adminLabRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/teacher", teacherAuthRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/lab-students", studentRoutes);
app.use("/api/practicals", practicalRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/student", studentLabRoutes);
app.use("/api/teacher/students", teacherStudentsRoutes);
app.use("/api/superadmin", superAdminRoutes);

app.get("/health", (req, res) => {
  return res.status(200).send("ok");
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000, () => {
  console.log("Server running on 3000");
});
