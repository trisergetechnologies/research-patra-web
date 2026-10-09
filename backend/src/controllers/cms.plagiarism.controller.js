import { ROLES } from '../config/roles.js';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import { audit } from '../services/audit.service.js';
import { enqueueScan, latestScan } from '../services/plagiarism/worker.js';
import { presentReport, summaryFor } from '../services/plagiarism/summary.js';
import { findVisible } from './cms.posts.controller.js';

function assertAdmin(req) {
  if (req.user.role !== ROLES.ADMIN) throw ApiError.forbidden('Only an admin can run a plagiarism check');
}

export const enqueuePlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const post = await findVisible(req);
  const { scan, created } = await enqueueScan(post);
  await audit(req.user, 'post.plagiarism', 'Post', post._id, { created });
  res.status(created ? 201 : 200).json({
    summary: summaryFor(scan, post),
    report: presentReport(scan),
  });
});

export const getPlagiarism = asyncHandler(async (req, res) => {
  assertAdmin(req);
  const post = await findVisible(req);
  const scan = await latestScan(post._id);
  res.json({
    summary: summaryFor(scan, post),
    report: presentReport(scan),
  });
});
