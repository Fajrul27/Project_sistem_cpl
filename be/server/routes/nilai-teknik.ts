// ============================================
// Nilai Teknik Penilaian Routes
// ============================================

import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireRole, requirePengampu } from '../middleware/auth.js';
import {
    getNilaiByMahasiswa,
    getNilaiByCpmk,
    getNilaiByMataKuliah,
    createOrUpdateNilai,
    batchInputNilai,
    updateNilai,
    deleteNilai,
    generateTemplate,
    importNilai
} from '../controllers/nilai-teknik-controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all nilai teknik by mahasiswa
router.get('/mahasiswa/:mahasiswaId', authMiddleware, getNilaiByMahasiswa);

// Get nilai teknik for specific CPMK
router.get('/cpmk/:cpmkId/:mahasiswaId', authMiddleware, getNilaiByCpmk);

// Get all nilai teknik for specific Mata Kuliah (Bulk fetch for Input Grid)
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, requirePengampu('mataKuliahId'), getNilaiByMataKuliah);

// Create/Update nilai teknik penilaian (single)
router.post('/', authMiddleware, requireRole('admin', 'dosen'), requirePengampu('mataKuliahId'), createOrUpdateNilai);

// Batch input nilai (untuk multiple mahasiswa)
router.post('/batch', authMiddleware, requireRole('admin', 'dosen'), batchInputNilai);

// Update nilai teknik
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), updateNilai);

// Delete nilai teknik
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), deleteNilai);

// ============================================
// EXCEL IMPORT / EXPORT
// ============================================

// Generate Template Excel
router.get('/template/:mataKuliahId', authMiddleware, requirePengampu('mataKuliahId'), generateTemplate);

// Import Excel  
router.post('/import', authMiddleware, requireRole('admin', 'dosen'), upload.single('file'), requirePengampu('mataKuliahId'), importNilai);

export default router;
