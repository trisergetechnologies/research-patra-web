import { User } from '../models/User.js';
import { LOGIN_ROLES } from '../config/roles.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import {
  REFRESH_COOKIE,
  signAccessToken,
  issueRefreshToken,
  findRefreshToken,
  claimRefreshToken,
  generateRawToken,
  hashToken,
  revokeFamily,
  revokeAllForUser,
  revokeByRaw,
  setRefreshCookie,
  clearRefreshCookie,
} from '../services/token.service.js';
import { OTP_RESEND_SECONDS, OTP_TTL_MINUTES, consumeLoginCode, issueLoginCode } from '../services/otp.service.js';

async function startSession(res, user, req) {
  const { raw } = await issueRefreshToken(user, { req });
  setRefreshCookie(res, raw);
  return signAccessToken(user);
}

const canSignIn = (user) => user && user.isActive && LOGIN_ROLES.includes(user.role);

// Same response whether or not the email belongs to an account, so it can't be used to probe for users.
export const requestCode = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (canSignIn(user)) await issueLoginCode(user);
  res.json({
    message: 'If this email has access, a sign-in code is on its way.',
    resendAfter: OTP_RESEND_SECONDS,
    expiresInMinutes: OTP_TTL_MINUTES,
  });
});

export const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const userId = await consumeLoginCode(email, code);
  const user = await User.findById(userId);
  if (!user || user.email !== email) throw ApiError.badRequest('Code expired. Request a new one.');
  if (!user.isActive) throw ApiError.forbidden('Account is disabled');
  if (!LOGIN_ROLES.includes(user.role)) throw ApiError.forbidden('This account cannot sign in here');

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = await startSession(res, user, req);
  res.json({ accessToken, user: user.toPublic() });
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) throw ApiError.unauthorized('No refresh token');

  const doc = await findRefreshToken(raw);
  if (!doc) {
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Invalid refresh token');
  }

  if (doc.revokedAt) {
    // A rotated token was presented again: treat as theft and kill the whole chain.
    await revokeFamily(doc.family);
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Refresh token reuse detected');
  }

  if (doc.expiresAt <= new Date()) {
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Refresh token expired');
  }

  const user = await User.findById(doc.user);
  if (!user || !user.isActive || !LOGIN_ROLES.includes(user.role)) {
    await revokeFamily(doc.family);
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Session is no longer valid');
  }

  const newRaw = generateRawToken();
  const claimed = await claimRefreshToken(doc, hashToken(newRaw));
  if (!claimed) {
    await revokeFamily(doc.family);
    clearRefreshCookie(res);
    throw ApiError.unauthorized('Refresh token reuse detected');
  }

  await issueRefreshToken(user, { family: doc.family, req, raw: newRaw });
  setRefreshCookie(res, newRaw);
  res.json({ accessToken: signAccessToken(user), user: user.toPublic() });
});

export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) await revokeByRaw(raw);
  clearRefreshCookie(res);
  res.status(204).end();
});

export const logoutAll = asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save();
  await revokeAllForUser(req.user._id);
  clearRefreshCookie(res);
  res.status(204).end();
});
