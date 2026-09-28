import express from "express";
import mongoose from "mongoose";
import Marks from "../../models/Marks.js";
import Practical from "../../models/Practical.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// ADD/UPDATE MARKS
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { studentId, practicalId } = req.body;

    if (!studentId || !practicalId) {
      return res.status(400).json({ error: "studentId and practicalId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }
    if (!mongoose.Types.ObjectId.isValid(practicalId)) {
      return res.status(400).json({ error: "Invalid practicalId" });
    }

    const { viva, execution, attendance, internal } = req.body;

    let marks = await Marks.findOne({ studentId, practicalId });

    if (marks) {
      if (viva !== undefined) marks.viva = viva;
      if (execution !== undefined) marks.execution = execution;
      if (attendance !== undefined) marks.attendance = attendance;
      if (internal !== undefined) marks.internal = internal;
      await marks.save();
    } else {
      marks = await Marks.create({
        studentId,
        practicalId,
        viva: viva || 0,
        execution: execution || 0,
        attendance: attendance || 0,
        internal: internal || 0
      });
    }

    res.json(marks);
  } catch (err) {
    console.error("Marks save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET MARKS BY STUDENT & PRACTICAL
router.get("/student/:studentId/:practicalId", authMiddleware, async (req, res) => {
  try {
    const marks = await Marks.findOne({
      studentId: req.params.studentId,
      practicalId: req.params.practicalId
    });
    console.log("marks", marks)
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL MARKS FOR A PRACTICAL
router.get("/practical/:practicalId", authMiddleware, async (req, res) => {
  try {
    const marks = await Marks.find({ practicalId: req.params.practicalId })
      .populate("studentId", "fullName rollNumber");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL MARKS FOR A LAB
router.get("/lab/:labId", authMiddleware, async (req, res) => {
  try {
    const practicals = await Practical.find({ labId: req.params.labId });
    const practicalIds = practicals.map(p => p._id);
    const marks = await Marks.find({ practicalId: { $in: practicalIds } })
      .populate("studentId", "fullName rollNumber")
      .populate("practicalId", "title");
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BULK UPDATE MARKS
router.post("/bulk", authMiddleware, async (req, res) => {
  try {
    const { marksData } = req.body;
    
    if (!marksData || !Array.isArray(marksData)) {
      return res.status(400).json({ error: "marksData array is required" });
    }

    const results = await Promise.all(
      marksData.map(async (m) => {
        const cleanData = {
          studentId: m.studentId,
          practicalId: m.practicalId,
          viva: m.viva || 0,
          execution: m.execution || 0,
          attendance: m.attendance || 0,
          internal: m.internal || 0
        };
        
        let marks = await Marks.findOne({ 
          studentId: m.studentId, 
          practicalId: m.practicalId 
        });
        
        if (marks) {
          marks.viva = cleanData.viva;
          marks.execution = cleanData.execution;
          marks.attendance = cleanData.attendance;
          marks.internal = cleanData.internal;
          await marks.save();
          return marks;
        } else {
          return await Marks.create(cleanData);
        }
      })
    );
    
    res.json(results);
  } catch (err) {
    console.error("Bulk marks save error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;