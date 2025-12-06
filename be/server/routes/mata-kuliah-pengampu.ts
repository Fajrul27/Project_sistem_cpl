
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getPengampuByMataKuliah,
    getAssignmentsByDosen,
    assignDosenToMataKuliah,
    removeDosenFromMataKuliah,
    getPesertaByMataKuliah
} from '../controllers/mata-kuliah-pengampu-controller.js';

const router = Router();

// Get all pengampu for a mata kuliah
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, getPengampuByMataKuliah);

// Get all mata kuliah for a dosen
router.get('/dosen/:dosenId', authMiddleware, getAssignmentsByDosen);

// Assign dosen to mata kuliah
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), assignDosenToMataKuliah);

// Remove dosen from mata kuliah
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), removeDosenFromMataKuliah);

// Get daftar peserta (mahasiswa) untuk mata kuliah yang diampu dosen
router.get('/peserta/:mataKuliahId', authMiddleware, requireRole('dosen'), getPesertaByMataKuliah);

export default router;
