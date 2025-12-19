
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

// Get all users (admin only -> dynamic)
router.get('/', authMiddleware, requirePermission('users', 'view'), getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, requirePermission('users', 'view'), getUserById);

// Update user role (admin only -> dynamic)
router.put('/:id/role', authMiddleware, requirePermission('users', 'edit'), updateUserRole);

// Update user basic info (admin only -> dynamic)
router.put('/:id', authMiddleware, requirePermission('users', 'edit'), updateUser);

// Delete user (admin only -> dynamic)
router.delete('/:id', authMiddleware, requirePermission('users', 'delete'), deleteUser);

export default router;
