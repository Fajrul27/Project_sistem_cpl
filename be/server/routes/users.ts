
import { Router } from 'express';
import { authMiddleware, requireRole, requirePermission } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser
} from '../controllers/users-controller.js';

const router = Router();

// Dynamic permission middleware for GET /users
// If role=mahasiswa query param, check 'mahasiswa' permission
// Otherwise check 'users' permission
const dynamicViewPermission = (req: any, res: any, next: any) => {
  const role = req.query.role;
  if (role === 'mahasiswa') {
    return requirePermission('view', 'mahasiswa')(req, res, next);
  }
  return requirePermission('view', 'users')(req, res, next);
};

// Get all users (dynamic permission based on role query param)
router.get('/', authMiddleware, dynamicViewPermission, getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, requirePermission('view', 'users'), getUserById);

// Update user role (admin only -> dynamic)
router.put('/:id/role', authMiddleware, requirePermission('edit', 'users'), updateUserRole);

// Update user basic info (admin only -> dynamic)
router.put('/:id', authMiddleware, requirePermission('edit', 'users'), updateUser);

// Delete user (admin only -> dynamic)
router.delete('/:id', authMiddleware, requirePermission('delete', 'users'), deleteUser);

export default router;
