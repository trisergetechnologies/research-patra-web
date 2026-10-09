import mongoose from 'mongoose';
import { Post, POST_STATUS as S, POST_STATUSES, REVISION_STATE as R } from '../models/Post.js';
import { AuditLog } from '../models/AuditLog.js';
import { Subscriber, SUBSCRIBER_STATUS as SUB } from '../models/Subscriber.js';
import { ROLES } from '../config/roles.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { escapeRegex } from '../utils/slug.js';
import { cursorPage } from '../utils/cursor.js';
import { can, visibilityFilter } from '../policies/post.policy.js';
import * as posts from '../services/post.service.js';
import { serializePostDetail, serializePostRow } from '../services/cms.serialize.js';
import { summariesFor, summaryFor } from '../services/plagiarism/summary.js';
import { latestScan } from '../services/plagiarism/worker.js';

const SORTS = {
  updated: { field: 'updatedAt', dir: -1 },
  oldest: { field: 'updatedAt', dir: 1 },
  published: { field: 'publishedAt', dir: -1 },
  title: { field: 'title', dir: 1 },
  views: { field: 'views', dir: -1 },
  submitted: { field: 'queuedAt', dir: 1 },
};

const isId = (v) => typeof v === 'string' && mongoose.isValidObjectId(v);
const str = (v) => (typeof v === 'string' ? v.trim() : '');

const reviewFilter = { $or: [{ status: S.IN_REVIEW }, { 'pendingRevision.state': R.IN_REVIEW }] };

export const listPosts = asyncHandler(async (req, res) => {
  const page = cursorPage(req.query, SORTS[req.query.sort] || SORTS.updated);
  const base = visibilityFilter(req.user);
  const and = [base];

  const status = str(req.query.status);
  if (status === 'deleted') and.push({ deletedAt: { $ne: null } });
  else {
    and.push({ deletedAt: null });
    if (status === 'review') and.push(reviewFilter);
    else if (POST_STATUSES.includes(status)) and.push({ status });
  }

  if (isId(req.query.category)) and.push({ category: req.query.category });
  if (isId(req.query.tag)) and.push({ tags: req.query.tag });
  if (isId(req.query.author)) and.push({ author: req.query.author });
  if (req.query.featured === 'true') and.push({ featured: true });
  if (req.query.mine === 'true') and.push({ createdBy: req.user._id });

  const q = str(req.query.q).slice(0, 100);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: [{ title: rx }, { slug: rx }, { excerpt: rx }] });
  }

  const filter = { $and: and };

  const [rows, total, counts] = await Promise.all([
    Post.find({ $and: [...and, page.filter] })
      .select('-contentHtml -keyTakeaways -seo -slugHistory -pendingRevision.contentHtml')
      .populate([
        { path: 'category', select: 'name slug color' },
        { path: 'author', select: 'displayName' },
        { path: 'createdBy', select: 'name role' },
        { path: 'coverImage', select: 'publicId' },
      ])
      .sort(page.sort)
      .limit(page.limit + 1),
    req.query.cursor ? null : Post.countDocuments(filter),
    req.query.cursor ? null : statusCounts(base),
  ]);

  const { items, nextCursor } = page.finish(rows);
  let postsOut = items.map(serializePostRow);
  if (req.user.role === ROLES.ADMIN && status === 'review') {
    const summaries = await summariesFor(items.map((post) => post._id));
    postsOut = postsOut.map((row) => ({ ...row, plagiarism: summaries.get(row.id) || { status: 'none', verdict: null, stale: false } }));
  }
  res.json({ posts: postsOut, nextCursor, ...(total === null ? {} : { total, counts }) });
});

/** Numbers shown on the status filter chips. */
async function statusCounts(base) {
  const [byStatus, review, deleted] = await Promise.all([
    Post.aggregate([{ $match: { ...base, deletedAt: null } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Post.countDocuments({ ...base, deletedAt: null, ...reviewFilter }),
    Post.countDocuments({ ...base, deletedAt: { $ne: null } }),
  ]);
  const counts = Object.fromEntries(POST_STATUSES.map((s) => [s, 0]));
  for (const row of byStatus) counts[row._id] = row.n;
  counts.all = byStatus.reduce((sum, row) => sum + row.n, 0);
  counts.review = review;
  counts.deleted = deleted;
  return counts;
}

/** Loads a post the user may see; others' posts look like 404 to staff so ids can't be probed. */
export async function findVisible(req, populate = false) {
  if (!isId(req.params.id)) throw ApiError.notFound('Post not found');
  const post = populate ? await posts.loadPostForCms(req.params.id) : await Post.findById(req.params.id);
  if (!post || !can(req.user, 'view', post)) throw ApiError.notFound('Post not found');
  return post;
}

async function presentPost(req, post) {
  const detail = serializePostDetail(post, req.user);
  if (req.user.role === ROLES.ADMIN) {
    detail.plagiarism = summaryFor(await latestScan(post._id), post);
  }
  return detail;
}

const respond = async (req, res, post, status = 200) => {
  const fresh = await posts.loadPostForCms(post._id);
  res.status(status).json({ post: await presentPost(req, fresh) });
};

export const getPost = asyncHandler(async (req, res) => {
  const post = await findVisible(req, true);
  res.json({ post: await presentPost(req, post) });
});

export const getPostHistory = asyncHandler(async (req, res) => {
  const post = await findVisible(req);
  const page = cursorPage(req.query, { field: 'at', dir: -1 });
  const rows = await AuditLog.find({ $and: [{ entity: 'Post', entityId: post._id }, page.filter] })
    .sort(page.sort)
    .limit(page.limit + 1)
    .populate('actor', 'name role')
    .lean();
  const { items: entries, nextCursor } = page.finish(rows);
  res.json({
    nextCursor,
    history: entries.map((e) => ({
      id: String(e._id),
      action: e.action,
      actor: e.actor ? { id: String(e.actor._id), name: e.actor.name, role: e.actor.role } : null,
      meta: e.meta ?? {},
      at: e.at,
    })),
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await posts.createPost(req.user, req.body);
  await respond(req, res, post, 201);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await posts.updatePost(req.user, await findVisible(req), req.body);
  await respond(req, res, post);
});

const action = (fn) =>
  asyncHandler(async (req, res) => {
    const post = await fn(req.user, await findVisible(req), req.body.version, req.body.note);
    await respond(req, res, post);
  });

export const submitPost = action(posts.submitPost);
export const approvePost = action(posts.approvePost);
export const requestChanges = action(posts.requestChanges);
export const discardRevision = action(posts.discardRevision);
export const unpublishPost = action(posts.unpublishPost);
export const archivePost = action(posts.archivePost);
export const restorePost = action(posts.restorePost);

export const deletePost = asyncHandler(async (req, res) => {
  const post = await findVisible(req);
  const version = Number(req.query.version);
  if (!Number.isInteger(version)) throw ApiError.badRequest('version is required');
  await posts.deletePost(req.user, post, version);
  res.status(204).end();
});

/** Series names already in use, for the editor's suggestions. */
export const listSeries = asyncHandler(async (req, res) => {
  const names = await Post.distinct('series', { deletedAt: null, series: { $nin: ['', null] } });
  res.json({ items: names.sort((a, b) => a.localeCompare(b)) });
});

export const getStats = asyncHandler(async (req, res) => {
  const admin = req.user.role === ROLES.ADMIN;
  const base = visibilityFilter(req.user);
  const live = { ...base, deletedAt: null };

  const [counts, views, top, needsAttention, activity, subscribers] = await Promise.all([
    statusCounts(base),
    Post.aggregate([{ $match: { ...live, status: S.PUBLISHED } }, { $group: { _id: null, n: { $sum: '$views' } } }]),
    Post.find({ ...live, status: S.PUBLISHED }).sort({ views: -1 }).limit(5).select('title slug views'),
    // Admin: things waiting for review. Staff: their posts sent back with feedback.
    Post.find(
      admin
        ? { ...live, ...reviewFilter }
        : { ...live, $or: [{ status: S.CHANGES_REQUESTED }, { 'pendingRevision.state': R.CHANGES_REQUESTED }] }
    )
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('title status pendingRevision.state submittedAt pendingRevision.submittedAt updatedAt createdBy')
      .populate('createdBy', 'name'),
    AuditLog.find(admin ? { entity: 'Post' } : { actor: req.user._id, entity: 'Post' })
      .sort({ at: -1 })
      .limit(8)
      .populate('actor', 'name')
      .lean(),
    admin ? Subscriber.countDocuments({ status: SUB.ACTIVE }) : null,
  ]);

  const titles = new Map(
    (await Post.find({ _id: { $in: activity.map((a) => a.entityId) } }).select('title').lean()).map((p) => [String(p._id), p.title])
  );

  res.json({
    counts,
    totalViews: views[0]?.n ?? 0,
    subscribers,
    topPosts: top.map((p) => ({ id: String(p._id), title: p.title, slug: p.slug, views: p.views })),
    needsAttention: needsAttention.map((p) => ({
      id: String(p._id),
      title: p.title,
      status: p.status,
      revisionState: p.pendingRevision?.state ?? null,
      by: p.createdBy?.name ?? null,
      at: p.pendingRevision?.submittedAt ?? p.submittedAt ?? p.updatedAt,
    })),
    activity: activity.map((a) => ({
      id: String(a._id),
      action: a.action,
      actor: a.actor?.name ?? 'Someone',
      postId: String(a.entityId),
      title: titles.get(String(a.entityId)) ?? '(deleted)',
      at: a.at,
    })),
  });
});
