import mongoose from 'mongoose';
import { ROLES } from '../config/roles.js';
import { Post } from '../models/Post.js';
import { PlagScan } from '../models/Plagiarism.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { audit } from '../services/audit.service.js';
import { enqueueScan, latestScan } from '../services/plagiarism/worker.js';
import { articleOf, listChecks, presentReport, summaryFor } from '../services/plagiarism/summary.js';
import { findVisible } from './cms.posts.controller.js';

function assertAdmin(req) {
  if (req.user.role !== ROLES.ADMIN) throw ApiError.forbidden('Only an admin can run a plagiarism check');
}

const payload = (scan, post) => ({
  summary: summaryFor(scan, post),
  report: presentReport(scan),
  article: articleOf(scan, post),
});

export const enqueuePlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const post = await findVisible(req);
  const { scan, created } = await enqueueScan(post);
  await audit(req.user, 'post.plagiarism', 'Post', post._id, { created });
  res.status(created ? 201 : 200).json(payload(scan, post));
});

export const getPlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const post = await findVisible(req);
  const scan = await latestScan(post._id);
  res.json(payload(scan, post));
});

export const listPlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  res.json(await listChecks(req.query));
});

export const getPlagiarismScan = asyncHandler(async (req, res) => {
  assertAdmin(req);
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.notFound('Plagiarism check not found');
  const scan = await PlagScan.findById(req.params.id);
  if (!scan) throw ApiError.notFound('Plagiarism check not found');
  const post = await Post.findById(scan.postId);
  res.json(payload(scan, post));
});
