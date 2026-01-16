import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getAuditLogs, restoreRecord, getStats, exportLogs } from '../controllers/audit-log-controller.js';

const router = express.Router();

router.use(authMiddleware);

// Stats & Export (Admin/Dekan)
router.get('/stats', requireRole('admin', 'dekan'), getStats);
router.get('/export', requireRole('admin', 'dekan'), exportLogs);

router.get('/', requireRole('admin', 'dekan'), getAuditLogs);
router.post('/:id/restore', requireRole('admin'), restoreRecord);

export default router;
