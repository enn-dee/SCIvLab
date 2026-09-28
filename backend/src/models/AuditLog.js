import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true, index: true },
  entityType: { type: String, enum: ["lab", "practical"], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, enum: ["created", "updated", "deleted"], required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  actorRole: { type: String, enum: ["admin", "teacher"], required: true },
  actorName: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

auditLogSchema.index({ labId: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
