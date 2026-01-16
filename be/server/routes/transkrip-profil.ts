
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTranskripProfilByMahasiswa } from '../controllers/transkrip-profil-controller.js';

const router = Router();

// GET /api/transkrip-profil/mahasiswa/:mahasiswaId
router.get('/mahasiswa/:mahasiswaId', authMiddleware, getTranskripProfilByMahasiswa);

export default router;
