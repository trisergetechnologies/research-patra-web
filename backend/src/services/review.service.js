import { Post, POST_STATUS as S, REVISION_STATE as R } from '../models/Post.js';
import { ReviewComment, COMMENT_STATUS as C } from '../models/ReviewComment.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { ROLES } from '../config/roles.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { can } from '../policies/post.policy.js';
import { content, userRef } from './cms.serialize.js';
import { sendNotice } from './mail.service.js';

const isAdmin = (user) => user.role === ROLES.ADMIN;
const isOwner = (user, post) => String(post.createdBy?._id ?? post.createdBy) === String(user._id);
const active = (postId) => ({ post: postId, closedAt: null });
const editUrl = (post) => `${env.adminUrl}/admin/posts/${post._id}`;

export const inReview = (post) => post.status === S.IN_REVIEW || post.pendingRevision?.state === R.IN_REVIEW;

const COMMENT_POPULATE = [
  { path: 'author', select: 'name role' },
  { path: 'resolvedBy', select: 'name role' },
  { path: 'replies.author', select: 'name role' },
];

export function serializeComment(c) {
  return {
    id: String(c._id),
    field: c.field,
    quote: c.quote,
    prefix: c.prefix,
    suffix: c.suffix,
    body: c.body,
    kind: c.kind,
    suggestion: c.suggestion ?? null,
    status: c.status,
    author: userRef(c.author),
    resolvedBy: userRef(c.resolvedBy),
    resolvedAt: c.resolvedAt,
    replies: c.replies.map((r) => ({ id: String(r._id), author: userRef(r.author), body: r.body, at: r.at })),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

const loadComment = (id) => ReviewComment.findById(id).populate(COMMENT_POPULATE);

/* ---------- reading ---------- */

/** Active comments (others' unsent drafts hidden) and the version the reviewer saw last time, for "changes since last review". */
export async function reviewState(user, post) {
  const [comments, submissions, round] = await Promise.all([
    ReviewComment.find({ ...active(post._id), $or: [{ status: { $ne: C.DRAFT } }, { author: user._id }] })
      .sort({ createdAt: 1 })
      .populate(COMMENT_POPULATE),
    Submission.find(active(post._id)).sort({ at: -1 }).limit(2).lean(),
    Submission.countDocuments(active(post._id)),
  ]);
  // While under review the newest submission is what is on screen, so the one before it is the baseline.
  const previous = inReview(post) ? submissions[1] : submissions[0];
  return {
    comments: comments.map(serializeComment),
    previous: previous ? { at: previous.at, content: previous.content } : null,
    round,
  };
}

/* ---------- comments ---------- */

export async function createComment(user, post, data) {
  if (!can(user, 'requestChanges', post)) throw ApiError.forbidden('Comments can be added while the post is in review');
  if (data.field === 'contentHtml' && !data.quote.trim()) throw ApiError.badRequest('Select some text to comment on');
  const latest = await Submission.findOne(active(post._id)).sort({ at: -1 }).select('_id').lean();
  const comment = await ReviewComment.create({
    ...data,
    quote: data.field === 'general' ? '' : data.quote,
    suggestion: data.suggestion?.trim() ? data.suggestion : null,
    post: post._id,
    submission: latest?._id ?? null,
    author: user._id,
  });
  return serializeComment(await loadComment(comment._id));
}

async function findComment(post, commentId) {
  const comment = await ReviewComment.findOne({ _id: commentId, post: post._id });
  if (!comment) throw ApiError.notFound('Comment not found');
  if (comment.closedAt) throw ApiError.badRequest('This review has ended');
  return comment;
}

export async function updateComment(user, post, commentId, data) {
  const comment = await findComment(post, commentId);
  const mine = String(comment.author) === String(user._id);

  const edits = ['body', 'kind', 'suggestion'].filter((k) => data[k] !== undefined);
  if (edits.length) {
    if (!mine) throw ApiError.forbidden('Only the reviewer can edit this comment');
    for (const k of edits) comment[k] = k === 'suggestion' && !data[k]?.trim() ? null : data[k];
  }

  if (data.status !== undefined && data.status !== comment.status) {
    if (comment.status === C.DRAFT) throw ApiError.badRequest('Send the review before resolving comments');
    if (!(isAdmin(user) || isOwner(user, post))) throw ApiError.forbidden("You can't resolve this comment");
    comment.status = data.status;
    comment.resolvedBy = data.status === C.RESOLVED ? user._id : null;
    comment.resolvedAt = data.status === C.RESOLVED ? new Date() : null;
  }

  await comment.save();
  return serializeComment(await loadComment(comment._id));
}

export async function deleteComment(user, post, commentId) {
  const comment = await findComment(post, commentId);
  if (String(comment.author) !== String(user._id)) throw ApiError.forbidden('Only the reviewer can delete this comment');
  await comment.deleteOne();
}

export async function addReply(user, post, commentId, body) {
  const comment = await findComment(post, commentId);
  if (comment.status === C.DRAFT) throw ApiError.badRequest('This comment has not been sent yet');
  if (comment.replies.length >= 50) throw ApiError.badRequest('This thread is full');
  comment.replies.push({ author: user._id, body });
  await comment.save();
  return serializeComment(await loadComment(comment._id));
}

/* ---------- review cycle (called by post.service) ---------- */

export async function assertNoOpenMustFix(post) {
  const left = await ReviewComment.countDocuments({ ...active(post._id), status: C.OPEN, kind: 'must' });
  if (left) {
    throw ApiError.badRequest(`Resolve ${left} must-fix comment${left === 1 ? '' : 's'} before submitting`);
  }
}

export const countDrafts = (user, post) => ReviewComment.countDocuments({ ...active(post._id), author: user._id, status: C.DRAFT });

/** Freezes what was submitted and tells the admins. */
export async function recordSubmission(user, post) {
  const revision = post.status === S.PUBLISHED;
  const prefix = revision ? 'pendingRevision.' : '';
  const doc = await Post.findById(post._id).populate([
    { path: `${prefix}category`, select: 'name slug color' },
    { path: `${prefix}tags`, select: 'name slug' },
    { path: `${prefix}coverImage` },
    { path: `${prefix}ogImage` },
  ]);
  await Submission.create({ post: post._id, revision, by: user._id, content: content(revision ? doc.pendingRevision : doc) });

  const [round, total, resolved, admins] = await Promise.all([
    Submission.countDocuments(active(post._id)),
    ReviewComment.countDocuments({ ...active(post._id), status: { $ne: C.DRAFT } }),
    ReviewComment.countDocuments({ ...active(post._id), status: C.RESOLVED }),
    User.find({ role: ROLES.ADMIN, isActive: true }).select('name email').lean(),
  ]);
  const what = revision ? 'edits to' : '';
  const message =
    round > 1
      ? `${user.name} resubmitted ${what} "${post.title}" for review.${total ? ` ${resolved} of ${total} comments resolved.` : ''}`
      : `${user.name} submitted ${what} "${post.title}" for review.`;
  for (const a of admins) {
    sendNotice({
      to: a.email,
      name: a.name,
      subject: `${round > 1 ? 'Resubmitted' : 'Ready for review'}: ${post.title}`,
      message: message.replace(/\s+/g, ' '),
      ctaLabel: 'Open review',
      ctaUrl: editUrl(post),
    });
  }
  return round;
}

/** Sends the reviewer's drafts to the writer and emails them. */
export async function publishDrafts(user, post, note) {
  const res = await ReviewComment.updateMany({ ...active(post._id), author: user._id, status: C.DRAFT }, { $set: { status: C.OPEN } });
  const sent = res.modifiedCount;
  const writer = await User.findById(post.createdBy).select('name email isActive').lean();
  if (writer?.isActive && String(writer._id) !== String(user._id)) {
    sendNotice({
      to: writer.email,
      name: writer.name,
      subject: `Changes requested: ${post.title}`,
      message: `${user.name} reviewed "${post.title}" and asked for changes${sent ? ` (${sent} comment${sent === 1 ? '' : 's'})` : ''}.`,
      quote: note,
      ctaLabel: 'See feedback',
      ctaUrl: editUrl(post),
    });
  }
  return sent;
}

/** Ends the cycle: unsent drafts go, the rest becomes read-only history. */
export async function closeCycle(post) {
  const now = new Date();
  await ReviewComment.deleteMany({ ...active(post._id), status: C.DRAFT });
  await Promise.all([
    ReviewComment.updateMany(active(post._id), { $set: { closedAt: now } }),
    Submission.updateMany(active(post._id), { $set: { closedAt: now } }),
  ]);
}
