
import { Router } from 'express';
import {
    getPermissions,
    exportPermissions,
    updatePermission,
    initializePermissions,
    getDefaultPermissions,
    updateDefaultPermissions
} from '../controllers/role-access-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// Only admin can manage permissions
// Everyone needs to read permissions to know what they can access
router.get('/', getPermissions);
router.get('/export', requireRole('admin'), exportPermissions);
router.put('/', requireRole('admin'), updatePermission);
router.post('/init', requireRole('admin'), initializePermissions);

// Default Roles Permissions
router.get('/defaults', requireRole('admin'), getDefaultPermissions);
router.put('/defaults', requireRole('admin'), updateDefaultPermissions);

export default router;
