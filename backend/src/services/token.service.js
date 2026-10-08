import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';

export const REFRESH_COOKIE = 'rp_rt';
const REFRESH_COOKIE_PATH = '/api/auth';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, tv: user.tokenVersion },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl, issuer: 'research-patra', audience: 'research-patra-admin' }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret, {
    issuer: 'research-patra',
    audience: 'research-patra-admin',
  });
}

export const generateRawToken = () => crypto.randomBytes(48).toString('base64url');

export async function issueRefreshToken(user, { family, req, raw = generateRawToken() } = {}) {
  const doc = await RefreshToken.create({
    user: user._id,
    tokenHash: sha256(raw),
    family: family || crypto.randomUUID(),
    expiresAt: new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
    userAgent: req?.get('user-agent')?.slice(0, 256),
    ip: req?.ip,
  });
  return { raw, doc };
}

export function findRefreshToken(raw) {
  return RefreshToken.findOne({ tokenHash: sha256(raw) });
}

// Atomically revokes the token only if it's still active, so two concurrent
// refreshes with the same token can't both succeed.
export function claimRefreshToken(doc, replacedByHash) {
  return RefreshToken.findOneAndUpdate(
    { _id: doc._id, revokedAt: null },
    { revokedAt: new Date(), replacedBy: replacedByHash },
    { returnDocument: 'after' }
  );
}

export function hashToken(raw) {
  return sha256(raw);
}

export function revokeFamily(family) {
  return RefreshToken.updateMany({ family, revokedAt: null }, { revokedAt: new Date() });
}

export function revokeAllForUser(userId) {
  return RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}

export function revokeByRaw(raw) {
  return RefreshToken.updateOne({ tokenHash: sha256(raw), revokedAt: null }, { revokedAt: new Date() });
}

function cookieOptions() {
  const sameSite = env.cookieSameSite;
  return {
    httpOnly: true,
    secure: env.isProd || sameSite === 'none',
    sameSite,
    path: REFRESH_COOKIE_PATH,
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  };
}

export function setRefreshCookie(res, raw) {
  res.cookie(REFRESH_COOKIE, raw, {
    ...cookieOptions(),
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
}
