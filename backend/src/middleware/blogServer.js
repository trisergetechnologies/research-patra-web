import { timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/** True when the request carries the blog server's shared secret (REVALIDATE_SECRET). */
export function isBlogServer(req) {
  if (!env.revalidateSecret) return false;
  const given = Buffer.from(String(req.get('x-preview-secret') || ''));
  const expected = Buffer.from(env.revalidateSecret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function requireBlogServer(req, res, next) {
  if (!env.revalidateSecret) return next(new ApiError(503, 'Preview is not configured'));
  if (!isBlogServer(req)) return next(ApiError.unauthorized('Unauthorized'));
  next();
}
