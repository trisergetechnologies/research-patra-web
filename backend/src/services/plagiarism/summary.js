import mongoose from 'mongoose';
import { Post } from '../../models/Post.js';
import { PlagScan } from '../../models/Plagiarism.js';
import { escapeRegex } from '../../utils/slug.js';
import { cursorPage } from '../../utils/cursor.js';
import { chipFor } from './status.js';
import { prepareArticle, scanSource } from './text.js';

const POST_FIELDS = 'title deletedAt contentHtml keyTakeaways status pendingRevision.title pendingRevision.contentHtml pendingRevision.keyTakeaways pendingRevision.state';

export function summaryFor(scan, post) {
  if (!post) return chipFor(scan, scan?.contentHash);
  const article = prepareArticle(scanSource(post));
  return chipFor(scan, article.hash);
}

export function articleOf(scan, post) {
  return {
    id: post ? String(post._id) : scan ? String(scan.postId) : null,
    title: scan?.snapshot?.title || post?.title || 'Untitled',
    exists: !!post && !post.deletedAt,
  };
}

function scanFilter(query) {
  const and = [];
  const status = typeof query.status === 'string' ? query.status.trim() : '';
  if (status === 'queued' || status === 'running') and.push({ status });
  else if (status === 'clear' || status === 'review' || status === 'strong') and.push({ status: 'complete', verdict: status });
  else if (status === 'incomplete') and.push({ status: { $in: ['incomplete', 'failed'] } });
  return and;
}

async function searchClause(query) {
  const q = (typeof query.q === 'string' ? query.q : '').trim().slice(0, 100);
  if (!q) return null;
  const rx = new RegExp(escapeRegex(q), 'i');
  const posts = await Post.find({ title: rx }).select('_id').limit(200).lean();
  return { $or: [{ 'snapshot.title': rx }, { postId: { $in: posts.map((post) => post._id) } }] };
}

async function hashesFor(postIds) {
  const posts = await Post.find({ _id: { $in: postIds } }).select(POST_FIELDS).lean();
  return new Map(posts.map((post) => [String(post._id), post]));
}

function checkRow(scan, post) {
  const summary = summaryFor(scan, post);
  return {
    id: String(scan._id),
    postId: String(scan.postId),
    title: scan.snapshot?.title || post?.title || 'Untitled',
    status: summary.status,
    verdict: summary.verdict,
    stale: summary.stale,
    internal: scan.hasReport ? scan.internal ?? 0 : null,
    web: scan.hasReport ? scan.web ?? 0 : null,
    at: scan.finishedAt || scan.createdAt,
  };
}

async function checkCounts() {
  const [row] = await PlagScan.aggregate([
    {
      $group: {
        _id: null,
        all: { $sum: 1 },
        queued: { $sum: { $cond: [{ $eq: ['$status', 'queued'] }, 1, 0] } },
        running: { $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] } },
        clear: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'complete'] }, { $eq: ['$verdict', 'clear'] }] }, 1, 0] } },
        review: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'complete'] }, { $eq: ['$verdict', 'review'] }] }, 1, 0] } },
        strong: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'complete'] }, { $eq: ['$verdict', 'strong'] }] }, 1, 0] } },
        incomplete: { $sum: { $cond: [{ $in: ['$status', ['incomplete', 'failed']] }, 1, 0] } },
      },
    },
  ]);
  return {
    all: row?.all ?? 0,
    queued: row?.queued ?? 0,
    running: row?.running ?? 0,
    clear: row?.clear ?? 0,
    review: row?.review ?? 0,
    strong: row?.strong ?? 0,
    incomplete: row?.incomplete ?? 0,
  };
}

/** Newest checks first. Counts and the filtered total are omitted on later pages. */
export async function listChecks(query) {
  const page = cursorPage(query, { field: 'createdAt', dir: -1 });
  const and = scanFilter(query);
  const search = await searchClause(query);
  if (search) and.push(search);
  const match = and.length ? { $and: and } : {};
  const where = and.length ? { $and: [...and, ...(Object.keys(page.filter).length ? [page.filter] : [])] } : page.filter;

  const [rows, total, counts] = await Promise.all([
    PlagScan.aggregate([
      { $match: where },
      { $sort: page.sort },
      { $limit: page.limit + 1 },
      {
        $project: {
          postId: 1,
          contentHash: 1,
          status: 1,
          verdict: 1,
          createdAt: 1,
          finishedAt: 1,
          'snapshot.title': 1,
          internal: '$report.internal.overlap',
          web: '$report.web.overlap',
          hasReport: { $ne: ['$report', null] },
        },
      },
    ]),
    query.cursor ? null : PlagScan.countDocuments(match),
    query.cursor ? null : checkCounts(),
  ]);

  const { items, nextCursor } = page.finish(rows);
  const posts = await hashesFor(items.map((scan) => scan.postId));
  return {
    checks: items.map((scan) => checkRow(scan, posts.get(String(scan.postId)))),
    nextCursor,
    ...(total === null ? {} : { total, counts }),
  };
}

export async function summariesFor(postIds) {
  const ids = postIds.filter((id) => mongoose.isValidObjectId(id));
  if (!ids.length) return new Map();
  const posts = await Post.find({ _id: { $in: ids } })
    .select('title contentHtml keyTakeaways status pendingRevision.title pendingRevision.contentHtml pendingRevision.keyTakeaways pendingRevision.state')
    .lean();
  const hashes = new Map(posts.map((post) => [String(post._id), prepareArticle(scanSource(post)).hash]));
  const scans = await PlagScan.aggregate([
    { $match: { postId: { $in: posts.map((post) => post._id) } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$postId', status: { $first: '$status' }, verdict: { $first: '$verdict' }, contentHash: { $first: '$contentHash' } } },
  ]);
  const latest = new Map(scans.map((scan) => [String(scan._id), scan]));
  const out = new Map();
  for (const id of hashes.keys()) {
    out.set(id, chipFor(latest.get(id), hashes.get(id)));
  }
  return out;
}

export function presentReport(scan) {
  if (!scan?.report) return null;
  return {
    status: scan.status,
    verdict: scan.verdict,
    failureReason: scan.failureReason || '',
    finishedAt: scan.finishedAt || null,
    internal: scan.report.internal,
    web: scan.report.web,
    sources: scan.report.sources || [],
  };
}
