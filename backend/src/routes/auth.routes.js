import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requestCodeSchema, verifyCodeSchema } from '../validators/schemas.js';
import { requestCode, verifyCode, refresh, logout, logoutAll } from '../controllers/auth.controller.js';

const limiter = (windowMinutes, limit, message, extra = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
    ...extra,
  });

const requestIpLimiter = limiter(15, 20, 'Too many code requests, try again later');
const requestEmailLimiter = limiter(60, 6, 'Too many codes requested for this email, try again later', {
  keyGenerator: (req) => `email:${String(req.body?.email || '').trim().toLowerCase() || ipKeyGenerator(req.ip)}`,
});
const verifyLimiter = limiter(15, 30, 'Too many attempts, try again later', { skipSuccessfulRequests: true });
const refreshLimiter = limiter(15, 100, 'Too many requests, try again later');

const router = Router();

router.post('/otp/request', requestIpLimiter, requestEmailLimiter, validate(requestCodeSchema), requestCode);
router.post('/otp/verify', verifyLimiter, validate(verifyCodeSchema), verifyCode);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);

export default router;
