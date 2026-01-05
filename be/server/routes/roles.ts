import { Router } from 'express';
import {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    initializeSystemRoles
} from '../controllers/role-controller.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all roles (accessible to all authenticated users - needed for UI dropdowns, role management, etc.)
router.get('/', getAllRoles);

// Initialize system roles (admin only, typically run once after migration)
router.post('/init', requirePermission('create', 'roles'), initializeSystemRoles);

// Get specific role
router.get('/:id', requirePermission('view', 'roles'), getRoleById);

// Create new role (admin only)
router.post('/', requirePermission('create', 'roles'), createRole);

// Update role (admin only)
router.put('/:id', requirePermission('edit', 'roles'), updateRole);

// Delete role (admin only)
router.delete('/:id', requirePermission('delete', 'roles'), deleteRole);

// Toggle role status (admin only)
router.patch('/:id/toggle', requirePermission('edit', 'roles'), toggleRoleStatus);

export default router;
