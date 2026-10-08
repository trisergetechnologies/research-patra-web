import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

/*
 * Keyset ("load more") paging: sort by one field plus _id, and ask for rows after the last one seen.
 * Stays fast at any depth and never repeats or skips rows when new ones are added meanwhile.
 * Missing values (e.g. drafts without publishedAt) sort first ascending / last descending, like MongoDB does.
 */

const read = (doc, field) => (typeof doc.get === 'function' ? doc.get(field) : field.split('.').reduce((o, k) => o?.[k], doc));

function encode(doc, field) {
  const v = read(doc, field);
  const value = v == null ? null : v instanceof Date ? ['d', v.toISOString()] : typeof v === 'number' ? ['n', v] : ['s', String(v)];
  return Buffer.from(JSON.stringify([value, String(doc._id)])).toString('base64url');
}

function decode(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const [value, id] = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (!mongoose.isValidObjectId(id)) throw new Error('bad id');
    let v = null;
    if (value !== null) {
      const [type, x] = value;
      v = type === 'd' ? new Date(x) : type === 'n' ? Number(x) : type === 's' ? String(x) : undefined;
      if (v === undefined || (v instanceof Date && Number.isNaN(v.getTime())) || Number.isNaN(v)) throw new Error('bad value');
    }
    return { v, id: new mongoose.Types.ObjectId(id) };
  } catch {
    throw ApiError.badRequest('Invalid cursor');
  }
}

function after(field, dir, { v, id }) {
  const op = dir === 1 ? '$gt' : '$lt';
  if (v === null) {
    const sameNull = { [field]: null, _id: { [op]: id } };
    return dir === 1 ? { $or: [sameNull, { [field]: { $ne: null } }] } : sameNull;
  }
  const or = [{ [field]: { [op]: v } }, { [field]: v, _id: { [op]: id } }];
  if (dir === -1) or.push({ [field]: null });
  return { $or: or };
}

/**
 * const page = cursorPage(req.query, { field: 'updatedAt', dir: -1 });
 * const rows = await Model.find({ $and: [filter, page.filter] }).sort(page.sort).limit(page.limit + 1);
 * res.json({ items, ...page.finish(rows) });
 */
export function cursorPage(query, { field, dir }, { def = 20, max = 50 } = {}) {
  const limit = Math.min(max, Math.max(1, Number.parseInt(query.limit, 10) || def));
  const cursor = decode(query.cursor);
  return {
    limit,
    sort: { [field]: dir, _id: dir },
    filter: cursor ? after(field, dir, cursor) : {},
    finish(rows) {
      const more = rows.length > limit;
      const items = more ? rows.slice(0, limit) : rows;
      return { items, nextCursor: more ? encode(items[items.length - 1], field) : null };
    },
  };
}
