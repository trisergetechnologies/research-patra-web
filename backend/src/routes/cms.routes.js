import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/roles.js';
import { uploadSingleImage } from '../services/media.service.js';
import {
  createPostSchema,
  updatePostSchema,
  postActionSchema,
  requestChangesSchema,
  categorySchema,
  updateCategorySchema,
  tagSchema,
  updateTagSchema,
  mergeTagSchema,
  updateMyAuthorSchema,
  adminUpdateAuthorSchema,
  uploadMediaSchema,
  updateMediaSchema,
  createCommentSchema,
  updateCommentSchema,
  replySchema,
} from '../validators/cms.schemas.js';
import * as P from '../controllers/cms.posts.controller.js';
import * as RV from '../controllers/cms.review.controller.js';
import * as T from '../controllers/cms.taxonomy.controller.js';
import * as M from '../controllers/cms.media.controller.js';
import * as A from '../controllers/cms.authors.controller.js';
import { createPreviewTicket } from '../controllers/preview.controller.js';

const router = Router();
const adminOnly = authorize(ROLES.ADMIN);

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 40,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many uploads, try again in a few minutes' },
});

const previewLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many previews, try again in a few minutes' },
});

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.STAFF));

router.get('/stats', P.getStats);
router.get('/series', P.listSeries);

router.get('/posts', P.listPosts);
router.post('/posts', validate(createPostSchema), P.createPost);
router.get('/posts/:id', P.getPost);
router.get('/posts/:id/history', P.getPostHistory);
router.patch('/posts/:id', validate(updatePostSchema), P.updatePost);
router.delete('/posts/:id', P.deletePost);
router.post('/posts/:id/submit', validate(postActionSchema), P.submitPost);
router.post('/posts/:id/approve', validate(postActionSchema), P.approvePost);
router.post('/posts/:id/request-changes', validate(requestChangesSchema), P.requestChanges);
router.post('/posts/:id/discard-revision', validate(postActionSchema), P.discardRevision);
router.post('/posts/:id/unpublish', validate(postActionSchema), P.unpublishPost);
router.post('/posts/:id/archive', validate(postActionSchema), P.archivePost);
router.post('/posts/:id/restore', validate(postActionSchema), P.restorePost);
router.post('/posts/:id/preview-ticket', previewLimiter, createPreviewTicket);
router.get('/posts/:id/review', RV.getReview);
router.post('/posts/:id/comments', validate(createCommentSchema), RV.createComment);
router.patch('/posts/:id/comments/:commentId', validate(updateCommentSchema), RV.updateComment);
router.delete('/posts/:id/comments/:commentId', RV.deleteComment);
router.post('/posts/:id/comments/:commentId/replies', validate(replySchema), RV.addReply);

router.get('/media/rules', M.getMediaRules);
router.get('/media', M.listMedia);
router.post('/media', uploadLimiter, uploadSingleImage, validate(uploadMediaSchema), M.uploadMedia);
router.get('/media/:id/usage', M.getMediaUsage);
router.patch('/media/:id', validate(updateMediaSchema), M.updateMedia);
router.delete('/media/:id', M.removeMedia);

router.get('/categories', T.listCategories);
router.post('/categories', adminOnly, validate(categorySchema), T.createCategory);
router.patch('/categories/:id', adminOnly, validate(updateCategorySchema), T.updateCategory);
router.delete('/categories/:id', adminOnly, T.deleteCategory);

router.get('/tags', T.listTags);
router.post('/tags', adminOnly, validate(tagSchema), T.createTag);
router.patch('/tags/:id', adminOnly, validate(updateTagSchema), T.updateTag);
router.post('/tags/:id/merge', adminOnly, validate(mergeTagSchema), T.mergeTag);
router.delete('/tags/:id', adminOnly, T.deleteTag);

router.get('/authors/me', A.getMyAuthor);
router.patch('/authors/me', validate(updateMyAuthorSchema), A.updateMyAuthor);
router.get('/authors', adminOnly, A.listAuthors);
router.patch('/authors/:id', adminOnly, validate(adminUpdateAuthorSchema), A.updateAuthor);

export default router;
