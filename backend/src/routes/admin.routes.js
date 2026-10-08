import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/roles.js';
import { createUserSchema, adminUpdateUserSchema } from '../validators/schemas.js';
import { listUsers, createUser, updateUser } from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/users', listUsers);
router.post('/users', validate(createUserSchema), createUser);
router.patch('/users/:id', validate(adminUpdateUserSchema), updateUser);

export default router;
