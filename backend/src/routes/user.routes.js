import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { LOGIN_ROLES } from '../config/roles.js';
import { updateProfileSchema } from '../validators/schemas.js';
import { getMe, updateMe } from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate, authorize(...LOGIN_ROLES));

router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);

export default router;
