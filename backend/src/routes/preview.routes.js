import { Router } from 'express';
import { exchangeTicket, getPreviewPost } from '../controllers/preview.controller.js';
import { requireBlogServer } from '../middleware/blogServer.js';

// Called only by the blog's server, never by browsers.
const router = Router();

router.use(requireBlogServer);
router.post('/exchange', exchangeTicket);
router.get('/posts/:id', getPreviewPost);

export default router;
