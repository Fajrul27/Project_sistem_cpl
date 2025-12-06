
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { register, login, getMe, logout } from '../controllers/auth-controller.js';

const router = Router();

// Register new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user
router.get('/me', authMiddleware, getMe);

// Logout
router.post('/logout', authMiddleware, logout);

export default router;
