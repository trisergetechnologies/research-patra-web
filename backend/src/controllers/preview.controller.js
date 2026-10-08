import mongoose from 'mongoose';
import { Post, CONTENT_KEYS } from '../models/Post.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { readingTime } from '../utils/html.js';
import { can } from '../policies/post.policy.js';
import { FULL_POPULATE, full } from './public.controller.js';
import { exchangePreviewTicket, issuePreviewTicket, verifyPreviewSession, TICKET_TTL_SECONDS } from '../services/preview.service.js';

const validId = (id) => mongoose.isValidObjectId(id);

/* ---------- admin (authenticated) ---------- */

export const createPreviewTicket = asyncHandler(async (req, res) => {
  const post = validId(req.params.id) ? await Post.findById(req.params.id).select('createdBy deletedAt') : null;
  if (!post || !can(req.user, 'view', post)) throw ApiError.notFound('Post not found');
  if (post.deletedAt) throw ApiError.badRequest('Restore the post to preview it');
  const ticket = await issuePreviewTicket(req.user, post, req.body?.target);
  res.status(201).json({ ticket, expiresIn: TICKET_TTL_SECONDS, path: `/blog/preview/${post._id}/start?t=${encodeURIComponent(ticket)}` });
});

/* ---------- blog server only (shared secret) ---------- */

export const exchangeTicket = asyncHandler(async (req, res) => {
  const { ticket, postId } = req.body || {};
  if (typeof ticket !== 'string' || !ticket || !validId(postId)) throw ApiError.badRequest('Invalid preview link');
  res.json(await exchangePreviewTicket(ticket, postId));
});

export const getPreviewPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) throw ApiError.notFound('Post not found');
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw ApiError.unauthorized('Preview session expired');
  const { target } = await verifyPreviewSession(token, id);

  const raw = await Post.findById(id).lean();
  if (!raw || raw.deletedAt) throw ApiError.notFound('Post not found');
  const rev = target !== 'live' ? raw.pendingRevision : null;
  const doc = rev
    ? { ...raw, ...Object.fromEntries(CONTENT_KEYS.map((k) => [k, rev[k]])), updatedAt: rev.updatedAt || raw.updatedAt }
    : raw;
  await Post.populate(doc, FULL_POPULATE);

  res.set('Cache-Control', 'no-store');
  res.json({
    post: {
      ...full(doc),
      readingTime: readingTime(doc.contentHtml || ''),
      status: raw.status,
      isRevision: !!rev,
    },
  });
});
