import mongoose from 'mongoose';
import { Post } from '../../models/Post.js';
import { PlagScan } from '../../models/Plagiarism.js';
import { chipFor } from './status.js';
import { prepareArticle, scanSource } from './text.js';

export function summaryFor(scan, post) {
  const article = prepareArticle(scanSource(post));
  return chipFor(scan, article.hash);
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
