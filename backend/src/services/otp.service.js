import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { LoginCode } from '../models/LoginCode.js';
import { ApiError } from '../utils/ApiError.js';
import { sendLoginCode } from './mail.service.js';
import { logger } from '../utils/logger.js';

export const OTP_TTL_MINUTES = 10;
export const OTP_RESEND_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

const hashCode = (email, code) => createHmac('sha256', env.jwtAccessSecret).update(`${email}:${code}`).digest('hex');

function sameHash(a, b) {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Issues a fresh code for an eligible user. Within the resend window it silently does nothing. */
export async function issueLoginCode(user) {
  const email = user.email;
  const latest = await LoginCode.findOne({ email }).sort({ createdAt: -1 });
  if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_SECONDS * 1000) return;

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await LoginCode.deleteMany({ email });
  const doc = await LoginCode.create({
    email,
    user: user._id,
    codeHash: hashCode(email, code),
    expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
  });

  try {
    await sendLoginCode({ to: email, name: user.name, code, minutes: OTP_TTL_MINUTES });
  } catch (err) {
    await doc.deleteOne();
    logger.error('mail', 'login code failed', err);
    const apiErr = new ApiError(503, 'Could not send the code right now. Try again in a minute.');
    apiErr.logged = true;
    throw apiErr;
  }
}

/** Checks a code and consumes it. Returns the user id it was issued for. */
export async function consumeLoginCode(email, code) {
  const doc = await LoginCode.findOne({ email, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!doc) throw ApiError.badRequest('Code expired. Request a new one.');

  if (!sameHash(doc.codeHash, hashCode(email, code))) {
    const updated = await LoginCode.findOneAndUpdate({ _id: doc._id }, { $inc: { attempts: 1 } }, { returnDocument: 'after' });
    const left = OTP_MAX_ATTEMPTS - (updated?.attempts ?? OTP_MAX_ATTEMPTS);
    if (left <= 0) {
      await LoginCode.deleteOne({ _id: doc._id });
      throw ApiError.badRequest('Too many wrong attempts. Request a new code.');
    }
    throw ApiError.badRequest(`Incorrect code. ${left} ${left === 1 ? 'try' : 'tries'} left.`);
  }

  // Deleting is the claim: if two requests race with the right code, only one wins.
  const claimed = await LoginCode.findOneAndDelete({ _id: doc._id, attempts: { $lt: OTP_MAX_ATTEMPTS } });
  if (!claimed) throw ApiError.badRequest('Code expired. Request a new one.');
  return claimed.user;
}
