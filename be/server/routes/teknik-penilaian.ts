
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getTeknikByCpmk,
    createTeknikPenilaian,
    updateTeknikPenilaian,
    deleteTeknikPenilaian
} from '../controllers/teknik-penilaian-controller.js';

const router = Router();

// Get teknik penilaian by CPMK ID
router.get('/cpmk/:cpmkId', authMiddleware, getTeknikByCpmk);

// Create teknik penilaian
router.post('/', authMiddleware, requireRole('admin', 'dosen'), createTeknikPenilaian);

// Update teknik penilaian
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), updateTeknikPenilaian);

// Delete teknik penilaian
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), deleteTeknikPenilaian);

export default router;


