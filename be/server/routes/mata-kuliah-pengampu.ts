
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getPengampuByMataKuliah,
    getAssignmentsByDosen,
    assignDosenToMataKuliah,
    removeDosenFromMataKuliah,
    getPesertaByMataKuliah,
    getAllAssignments,
    exportPengampu,
    importPengampu,
    getTemplatePengampu
} from '../controllers/mata-kuliah-pengampu-controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });


const router = Router();

// Get all assignments (filtering by query params)
router.get('/', authMiddleware, requireRole('admin', 'kaprodi', 'dosen'), getAllAssignments);

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

// Export/Import routes
router.get('/export/excel', authMiddleware, requireRole('admin', 'kaprodi'), exportPengampu);
router.get('/template/excel', authMiddleware, requireRole('admin', 'kaprodi'), getTemplatePengampu);
router.post('/import/excel', authMiddleware, requireRole('admin', 'kaprodi'), upload.single('file'), importPengampu);


export default router;
