import { PlagMonthQuota } from '../../models/Plagiarism.js';
import { LIMITS } from './limits.js';

export function currentMonth(now = new Date()) {
  return now.toISOString().slice(0, 7);
}

export function nextMonthLabel(month = currentMonth()) {
  const [y, m] = month.split('-').map(Number);
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return `${next.y}-${String(next.m).padStart(2, '0')}`;
}

export async function getMonthQuota(userId, now = new Date()) {
  const month = currentMonth(now);
  const doc = userId ? await PlagMonthQuota.findOne({ userId, month }).lean() : null;
  const used = doc?.checkCount || 0;
  const limit = LIMITS.monthlyChecks;
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    month,
    resetMonth: nextMonthLabel(month),
  };
}

/** Atomically spend one monthly slot. Returns false when the free month is used up. */
export async function consumeMonthCheck(userId, now = new Date()) {
  if (!userId) return false;
  const month = currentMonth(now);
  try {
    await PlagMonthQuota.updateOne({ userId, month }, { $setOnInsert: { checkCount: 0 } }, { upsert: true });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  const doc = await PlagMonthQuota.findOneAndUpdate(
    { userId, month, checkCount: { $lt: LIMITS.monthlyChecks } },
    { $inc: { checkCount: 1 } },
    { returnDocument: 'after' }
  );
  return Boolean(doc);
}

export async function releaseMonthCheck(userId, now = new Date()) {
  if (!userId) return;
  const month = currentMonth(now);
  await PlagMonthQuota.updateOne({ userId, month, checkCount: { $gt: 0 } }, { $inc: { checkCount: -1 } });
}
