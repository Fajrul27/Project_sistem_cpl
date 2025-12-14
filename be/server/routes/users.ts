
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUser,
  deleteUser
} from '../controllers/users-controller.js';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), getAllUsers);

// Get user by ID
router.get('/:id', authMiddleware, requireRole('admin'), getUserById);

// Update user role (admin only)
router.put('/:id/role', authMiddleware, requireRole('admin'), updateUserRole);

// Update user basic info (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), updateUser);

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteUser);

export default router;
