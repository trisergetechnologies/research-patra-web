import mongoose from 'mongoose';
import { ApiError, asyncHandler } from '../utils/ApiError.js';
import * as review from '../services/review.service.js';
import { findVisible } from './cms.posts.controller.js';

const commentId = (req) => {
  if (!mongoose.isValidObjectId(req.params.commentId)) throw ApiError.notFound('Comment not found');
  return req.params.commentId;
};

export const getReview = asyncHandler(async (req, res) => {
  res.json(await review.reviewState(req.user, await findVisible(req)));
});

export const createComment = asyncHandler(async (req, res) => {
  res.status(201).json({ comment: await review.createComment(req.user, await findVisible(req), req.body) });
});

export const updateComment = asyncHandler(async (req, res) => {
  res.json({ comment: await review.updateComment(req.user, await findVisible(req), commentId(req), req.body) });
});

export const deleteComment = asyncHandler(async (req, res) => {
  await review.deleteComment(req.user, await findVisible(req), commentId(req));
  res.status(204).end();
});

export const addReply = asyncHandler(async (req, res) => {
  res.status(201).json({ comment: await review.addReply(req.user, await findVisible(req), commentId(req), req.body.body) });
});
