import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { LOGIN_ROLES } from '../config/roles.js';
import { PreviewTicket } from '../models/PreviewTicket.js';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { can } from '../policies/post.policy.js';
import { ApiError } from '../utils/ApiError.js';

export const TICKET_TTL_SECONDS = 60;
export const SESSION_TTL_SECONDS = 30 * 60;
const AUDIENCE = 'research-patra-preview';

const hash = (raw) => createHash('sha256').update(raw).digest('hex');

/** One-time ticket the editor hands to the blog; the blog swaps it for a private preview session. */
export async function issuePreviewTicket(user, post, target) {
  const raw = randomBytes(32).toString('base64url');
  await PreviewTicket.create({
    tokenHash: hash(raw),
    user: user._id,
    post: post._id,
    target: target === 'live' ? 'live' : 'revision',
    expiresAt: new Date(Date.now() + TICKET_TTL_SECONDS * 1000),
  });
  return raw;
}

const denied = () => ApiError.forbidden('You do not have access to this preview');

/** Re-checks access on every use, so disabling a user, signing out everywhere or losing ownership ends the preview. */
async function authorizeViewer(userId, postId, tokenVersion) {
  const [user, post] = await Promise.all([User.findById(userId), Post.findById(postId).select('createdBy deletedAt')]);
  if (!user || !user.isActive || !LOGIN_ROLES.includes(user.role)) throw denied();
  if (tokenVersion !== undefined && tokenVersion !== user.tokenVersion) throw ApiError.unauthorized('Preview session expired');
  if (!post || post.deletedAt) throw ApiError.notFound('Post not found');
  if (!can(user, 'view', post)) throw denied();
  return user;
}

export async function exchangePreviewTicket(raw, postId) {
  const ticket = await PreviewTicket.findOneAndDelete({ tokenHash: hash(String(raw)), post: postId, expiresAt: { $gt: new Date() } });
  if (!ticket) throw ApiError.unauthorized('Preview link expired. Open the preview again from the editor.');
  const user = await authorizeViewer(ticket.user, ticket.post);
  const session = jwt.sign(
    { sub: user._id.toString(), pid: ticket.post.toString(), tgt: ticket.target, tv: user.tokenVersion },
    env.jwtAccessSecret,
    { expiresIn: SESSION_TTL_SECONDS, issuer: 'research-patra', audience: AUDIENCE }
  );
  return { session, expiresIn: SESSION_TTL_SECONDS };
}

/** Returns { target } for a valid session on this post. */
export async function verifyPreviewSession(token, postId) {
  let claims;
  try {
    claims = jwt.verify(token, env.jwtAccessSecret, { issuer: 'research-patra', audience: AUDIENCE });
  } catch {
    throw ApiError.unauthorized('Preview session expired');
  }
  if (claims.pid !== String(postId)) throw denied();
  await authorizeViewer(claims.sub, postId, claims.tv);
  return { target: claims.tgt };
}
