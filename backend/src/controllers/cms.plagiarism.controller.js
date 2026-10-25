import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';
import { Post } from '../models/Post.js';
import { PlagScan } from '../models/Plagiarism.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { audit } from '../services/audit.service.js';
import { getMonthQuota } from '../services/plagiarism/quota.js';
import { tavilyConfigured } from '../services/plagiarism/tavily.js';
import { enqueueScan, latestScan } from '../services/plagiarism/worker.js';
import { articleOf, listChecks, presentReport, summaryFor } from '../services/plagiarism/summary.js';
import { findVisible } from './cms.posts.controller.js';

function assertAdmin(req) {
  if (req.user.role !== ROLES.ADMIN) throw ApiError.forbidden('Only an admin can run a plagiarism check');
}

const payload = (scan, post, quota) => ({
  summary: summaryFor(scan, post),
  report: presentReport(scan),
  article: articleOf(scan, post),
  ...(quota ? { quota } : {}),
});

export const enqueuePlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  if (!tavilyConfigured()) {
    throw new ApiError(503, 'Plagiarism web search is not configured. Set TAVILY_API_KEY on the server.');
  }
  const post = await findVisible(req);
  const { scan, created, quota, quotaExceeded } = await enqueueScan(post, { userId: req.user._id });
  if (quotaExceeded) {
    throw new ApiError(429, `You have used all ${quota.limit} plagiarism checks for ${quota.month}. The limit resets in ${quota.resetMonth}.`, { quota });
  }
  await audit(req.user, 'post.plagiarism', 'Post', post._id, { created });
  res.status(created ? 201 : 200).json(payload(scan, post, quota));
});

export const getPlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const post = await findVisible(req);
  const scan = await latestScan(post._id);
  const quota = await getMonthQuota(req.user._id);
  res.json(payload(scan, post, quota));
});

export const listPlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const [data, quota] = await Promise.all([listChecks(req.query), getMonthQuota(req.user._id)]);
  res.json({ ...data, quota });
});

export const getPlagiarismQuota = asyncHandler(async (req, res) => {
  assertAdmin(req);
  res.json({ quota: await getMonthQuota(req.user._id) });
});

export const getPlagiarismScan = asyncHandler(async (req, res) => {
  assertAdmin(req);
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Plagiarism check not found');
  const scan = await PlagScan.findById(req.params.id);
  if (!scan) throw ApiError.notFound('Plagiarism check not found');
  const post = await Post.findById(scan.postId);
  const quota = await getMonthQuota(req.user._id);
  res.json(payload(scan, post, quota));
});
