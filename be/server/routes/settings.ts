import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get settings - accessible by authenticated users (or public if needed for login page, but usually auth)
router.get('/', authMiddleware, getSettings);

// Update settings - only accessible by admin and kaprodi
router.put('/', authMiddleware, requireRole('admin', 'kaprodi'), updateSettings);

export default router;
