import crypto from 'node:crypto';
import { z } from 'zod';
import { Subscriber, SUBSCRIBER_STATUS as S } from '../models/Subscriber.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { sendNotice } from '../services/mail.service.js';

const RESEND_AFTER = 2 * 60 * 1000;

const newToken = () => {
  const token = crypto.randomBytes(24).toString('base64url');
  return { token, tokenHash: hash(token) };
};
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const link = (action, token) => `${env.siteUrl}/blog/newsletter?${action}=${encodeURIComponent(token)}`;

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
  source: z.string().trim().max(80).optional(),
});
const tokenSchema = z.object({ token: z.string().min(20).max(100) });

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    throw ApiError.badRequest('Validation failed', result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  }
  return result.data;
}

function sendConfirm(email, token) {
  return sendNotice({
    to: email,
    name: 'there',
    subject: 'Confirm your Research Patra subscription',
    message: 'please confirm you want research tips from the Research Patra journal. One click and you are in; if this was not you, ignore this email.',
    ctaLabel: 'Confirm subscription',
    ctaUrl: link('confirm', token),
  });
}

// The response is identical whether the address is new, pending or already active, so the form can't be used to probe the list.
export const subscribe = asyncHandler(async (req, res) => {
  const { email, source = '' } = parse(subscribeSchema, req.body);
  const existing = await Subscriber.findOne({ email });
  const reply = () => res.status(202).json({ message: 'Check your inbox to confirm your subscription.' });

  if (existing?.status === S.ACTIVE) return reply();
  if (existing?.status === S.PENDING && existing.confirmSentAt && Date.now() - existing.confirmSentAt < RESEND_AFTER) return reply();

  const { token, tokenHash } = newToken();
  try {
    await Subscriber.findOneAndUpdate(
      { email },
      { $set: { status: S.PENDING, tokenHash, confirmSentAt: new Date(), unsubscribedAt: null }, $setOnInsert: { source } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
    return reply();
  }
  await sendConfirm(email, token);
  reply();
});

async function byToken(body) {
  const { token } = parse(tokenSchema, body);
  const sub = await Subscriber.findOne({ tokenHash: hash(token) });
  if (!sub) throw ApiError.notFound('This link is invalid or has already been replaced by a newer one.');
  return sub;
}

export const confirm = asyncHandler(async (req, res) => {
  const sub = await byToken(req.body);
  if (sub.status !== S.ACTIVE) {
    sub.status = S.ACTIVE;
    sub.confirmedAt = new Date();
    sub.unsubscribedAt = null;
    await sub.save();
  }
  res.json({ status: sub.status });
});

export const unsubscribe = asyncHandler(async (req, res) => {
  const sub = await byToken(req.body);
  if (sub.status !== S.UNSUBSCRIBED) {
    sub.status = S.UNSUBSCRIBED;
    sub.unsubscribedAt = new Date();
    await sub.save();
  }
  res.json({ status: sub.status });
});
