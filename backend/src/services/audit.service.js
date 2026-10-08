import { AuditLog } from '../models/AuditLog.js';

/** Never throws: an audit failure must not undo the action it describes. */
export async function audit(actor, action, entity, entityId, meta = {}) {
  try {
    await AuditLog.create({ actor: actor._id ?? actor, action, entity, entityId, meta });
  } catch (err) {
    console.error('[audit] failed to record', action, err.message);
  }
}
