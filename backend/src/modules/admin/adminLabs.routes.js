import express from "express";
import Lab from "../../models/Lab.js";
import Teacher from "../../models/Teacher.js";
import LabTeacherAssignment from "../../models/LabTeacherAssignment.js";
import { authMiddleware } from "../../middleware/auth.js";
import { adminOnly } from "../../middleware/auth.js";

const router = express.Router();
router.use(authMiddleware, adminOnly);

router.post("/", async (req, res, next) => {
  try {
    const { name, subjectCode, session, deadline, teacherIds = [] } = req.body;
    if (!name || !subjectCode || !session) return res.status(400).json({ error: "name, subjectCode and session are required" });
    const teachers = await Teacher.find({ _id: { $in: teacherIds } }).select("_id");
    if (teachers.length !== teacherIds.length) return res.status(400).json({ error: "One or more teachers do not exist" });
    const lab = await Lab.create({ name, subjectCode, session, deadline, kind: "academic", rules: req.body.rules || {} });
    await LabTeacherAssignment.insertMany(teachers.map(({ _id }) => ({ labId: lab._id, teacherId: _id, assignedBy: req.user.id })));
    res.status(201).json(lab);
  } catch (error) { next(error); }
});

router.post("/:labId/teachers/:teacherId", async (req, res, next) => {
  try {
    const lab = await Lab.findById(req.params.labId);
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!lab || lab.kind !== "academic") return res.status(404).json({ error: "Academic lab not found" });
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    const assignment = await LabTeacherAssignment.findOneAndUpdate(
      { labId: lab._id, teacherId: teacher._id },
      { active: true, assignedBy: req.user.id }, { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(assignment);
  } catch (error) { next(error); }
});

router.delete("/:labId/teachers/:teacherId", async (req, res, next) => {
  try {
    const assignment = await LabTeacherAssignment.findOneAndUpdate(
      { labId: req.params.labId, teacherId: req.params.teacherId }, { active: false }, { new: true }
    );
    if (!assignment) return res.status(404).json({ error: "Teacher allocation not found" });
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
