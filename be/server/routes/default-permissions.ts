import { Router } from 'express';
import { DefaultPermissionController } from '../controllers/default-permission-controller.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// All routes require admin permission on 'role_access'
router.get('/', requirePermission('view', 'role_access'), DefaultPermissionController.getAllDefaults);
router.get('/export', requirePermission('view', 'role_access'), DefaultPermissionController.exportDefaults);
router.get('/:role', requirePermission('view', 'role_access'), DefaultPermissionController.getDefaultsByRole);
router.post('/initialize', requirePermission('create', 'role_access'), DefaultPermissionController.initialize);
router.post('/import', requirePermission('create', 'role_access'), DefaultPermissionController.importDefaults);
router.put('/:role', requirePermission('edit', 'role_access'), DefaultPermissionController.updateRoleDefaults);

export default router;
