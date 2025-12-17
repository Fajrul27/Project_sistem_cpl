
import { Router } from 'express';
import { getPermissions, updatePermission, initializePermissions } from '../controllers/role-access-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Only admin can manage permissions
router.get('/', requireRole('admin'), getPermissions);
router.put('/', requireRole('admin'), updatePermission);
router.post('/init', requireRole('admin'), initializePermissions);

export default router;
