import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: 'at', updatedAt: false } }
);

auditLogSchema.index({ entity: 1, entityId: 1, at: -1, _id: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
