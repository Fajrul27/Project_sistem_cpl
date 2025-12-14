
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { updateProfile, getProfileById } from '../controllers/profile-controller.js';

const router = Router();

// Update profile
router.put('/:id', authMiddleware, updateProfile);

// Get profile by ID
router.get('/:id', authMiddleware, getProfileById);

export default router;
