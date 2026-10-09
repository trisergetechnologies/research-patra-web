import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

/** Never throws: an audit failure must not undo the action it describes. */
export async function audit(actor, action, entity, entityId, meta = {}) {
  try {
    await AuditLog.create({ actor: actor._id ?? actor, action, entity, entityId, meta });
  } catch (err) {
    logger.warn('audit', `failed to record ${action}: ${err.message}`);
  }
}
