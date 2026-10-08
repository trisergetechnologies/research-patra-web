import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as C from '../controllers/public.controller.js';
import * as N from '../controllers/newsletter.controller.js';
import { isBlogServer } from '../middleware/blogServer.js';

const router = Router();

const limiter = (windowMs, limit, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests, please slow down' },
    ...extra,
  });

// The blog server fetches on behalf of every reader (and pre-renders pages at build), so it is never throttled.
const publicLimiter = limiter(60 * 1000, 300, { skip: isBlogServer });
const searchLimiter = limiter(60 * 1000, 30, { skip: (req) => !req.query.q || isBlogServer(req) });
const viewLimiter = limiter(10 * 60 * 1000, 120);
const voteLimiter = limiter(10 * 60 * 1000, 30);
const newsletterLimiter = limiter(60 * 60 * 1000, 10);

router.use(publicLimiter);
router.get('/posts', searchLimiter, C.listPosts);
router.get('/posts/featured', C.featuredPost);
router.get('/posts/trending', C.trendingPosts);
router.get('/posts/:slug', C.getPost);
router.get('/posts/:slug/related', C.relatedPosts);
router.get('/posts/:slug/adjacent', C.adjacentPosts);
router.post('/posts/:slug/view', viewLimiter, C.recordView);
router.post('/posts/:slug/vote', voteLimiter, C.recordVote);
router.post('/newsletter', newsletterLimiter, N.subscribe);
router.post('/newsletter/confirm', newsletterLimiter, N.confirm);
router.post('/newsletter/unsubscribe', newsletterLimiter, N.unsubscribe);
router.get('/categories', C.listCategories);
router.get('/tags', C.listTags);
router.get('/authors/:slug', C.getAuthor);
router.get('/sitemap', C.sitemap);

export default router;
