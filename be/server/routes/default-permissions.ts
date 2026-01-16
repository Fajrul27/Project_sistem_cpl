import { Router } from 'express';
import { DefaultPermissionController } from '../controllers/default-permission-controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

// All routes require authentication AND admin permission on 'role_access'
router.get('/', authMiddleware, requirePermission('view', 'role_access'), DefaultPermissionController.getAllDefaults);
router.get('/export', authMiddleware, requirePermission('view', 'role_access'), DefaultPermissionController.exportDefaults);
router.get('/:roleId', authMiddleware, requirePermission('view', 'role_access'), DefaultPermissionController.getDefaultsByRoleId);
router.post('/init', authMiddleware, requirePermission('create', 'role_access'), DefaultPermissionController.initialize);
router.post('/import', authMiddleware, requirePermission('create', 'role_access'), DefaultPermissionController.importDefaults);
router.put('/:roleId', authMiddleware, requirePermission('edit', 'role_access'), DefaultPermissionController.updateRoleDefaults);

export default router;
