import express from "express";
import Practical from "../models/Practical.js";
import { authMiddleware } from "../middleware/auth.js";
import { loadLab, loadPracticalLab, requireLabAccess } from "../middleware/labAccess.js";
import { recordAudit } from "../utils/audit.js";
import Enrollment from "../models/Enrollment.js";
import { getPracticalWeekState, getTestWeek } from "../utils/practicalSchedule.js";

const router = express.Router();
const editableFields = ["title", "description", "instructions", "materials", "deadline", "order", "starterTemplate", "testCases", "execution"];
const pick = (body) => Object.fromEntries(editableFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));

router.post("/", authMiddleware, loadLab, requireLabAccess("manage"), async (req, res, next) => {
  try {
    if (!req.body.title) return res.status(400).json({ error: "title is required" });
    const practical = await Practical.create({
      ...pick(req.body),
      labId: req.lab._id,
      execution: {
        ...(req.body.execution || {}),
        enabled: true,
      },
    });
    await recordAudit({ req, labId: req.lab._id, entityType: "practical", entityId: practical._id, action: "created", after: practical.toObject() });
    res.status(201).json(practical);
  } catch (error) { next(error); }
});

router.get("/lab/:labId", authMiddleware, loadLab, requireLabAccess("view"), async (req, res, next) => {
  try {
    const practicals = await Practical.find({ labId: req.lab._id }).sort({ order: 1 });
    const testWeek = getTestWeek(req);
    const enrollment = req.user.role === "student" && req.lab.kind === "academic"
      ? await Enrollment.findOne({
          labId: req.lab._id,
          studentId: req.user.id,
          status: "active",
        }).select("createdAt")
      : null;
    // Students must never receive hidden test data.
    const safePracticals = req.user.role === "student"
      ? practicals.map((item) => ({
          ...item.toObject(),
          testCases: item.testCases.filter((test) => test.visibility === "public"),
          ...(req.lab.kind === "academic" && enrollment
            ? { weekSchedule: getPracticalWeekState(item, enrollment.createdAt, new Date(), testWeek) }
            : {}),
        }))
      : practicals;
    res.json(safePracticals);
  } catch (error) { next(error); }
});

router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const practical = await Practical.findById(req.params.id);
    if (!practical) return res.status(404).json({ error: "Practical not found" });
    req.practical = practical;
    loadPracticalLab(req, res, async (loadError) => {
      if (loadError) return next(loadError);
      return requireLabAccess("view")(req, res, async (accessError) => {
        if (accessError) return next(accessError);
        const data = practical.toObject();
        if (req.user.role === "student") data.testCases = data.testCases.filter((test) => test.visibility === "public");
        if (req.user.role === "student" && req.lab.kind === "academic") {
          const enrollment = await Enrollment.findOne({
            labId: req.lab._id,
            studentId: req.user.id,
            status: "active",
          }).select("createdAt");
          if (enrollment) {
            data.weekSchedule = getPracticalWeekState(
              practical,
              enrollment.createdAt,
              new Date(),
              getTestWeek(req),
            );
          }
        }
        res.json(data);
      });
    });
  } catch (error) { next(error); }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const practical = await Practical.findById(req.params.id);
    if (!practical) return res.status(404).json({ error: "Practical not found" });
    req.practical = practical;
    loadPracticalLab(req, res, (loadError) => {
      if (loadError) return next(loadError);
      return requireLabAccess("manage")(req, res, async (accessError) => {
        if (accessError) return next(accessError);
        const updated = await Practical.findByIdAndUpdate(practical._id, pick(req.body), { new: true, runValidators: true });
        await recordAudit({ req, labId: req.lab._id, entityType: "practical", entityId: practical._id, action: "updated", before: practical.toObject(), after: updated.toObject() });
        res.json(updated);
      });
    });
  } catch (error) { next(error); }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const practical = await Practical.findById(req.params.id);
    if (!practical) return res.status(404).json({ error: "Practical not found" });
    req.practical = practical;
    loadPracticalLab(req, res, (loadError) => {
      if (loadError) return next(loadError);
      return requireLabAccess("manage")(req, res, async (accessError) => {
        if (accessError) return next(accessError);
        await Practical.findByIdAndDelete(practical._id);
        await recordAudit({ req, labId: req.lab._id, entityType: "practical", entityId: practical._id, action: "deleted", before: practical.toObject() });
        res.status(204).send();
      });
    });
  } catch (error) { next(error); }
});

export default router;
