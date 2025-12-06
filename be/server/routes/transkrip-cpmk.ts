
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getTranskripCpmkByMahasiswa } from '../controllers/transkrip-cpmk-controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/:mahasiswaId', getTranskripCpmkByMahasiswa);

export default router;
