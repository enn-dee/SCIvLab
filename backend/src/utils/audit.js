import AuditLog from "../models/AuditLog.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

export const recordAudit = async ({ req, labId, entityType, entityId, action, before, after }) => {
  const Actor = req.user.role === "teacher" ? Teacher : User;
  const actor = await Actor.findById(req.user.id).select("fullName");
  return AuditLog.create({
    labId,
    entityType,
    entityId,
    action,
    actorId: req.user.id,
    actorRole: req.user.role,
    actorName: actor?.fullName || "Unknown user",
    before,
    after,
  });
};
