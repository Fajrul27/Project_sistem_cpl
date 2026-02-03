
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { register, login, getMe, logout, loginAsUser, returnToAdmin } from '../controllers/auth-controller.js';

const router = Router();

// Register new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user
router.get('/me', authMiddleware, getMe);

// Logout
router.post('/logout', authMiddleware, logout);

// Login As User (Admin only)
router.post('/login-as/:userId', authMiddleware, requireRole('admin'), loginAsUser);

// Return to Admin (Exit impersonation)
router.post('/return-to-admin', authMiddleware, returnToAdmin);

export default router;
