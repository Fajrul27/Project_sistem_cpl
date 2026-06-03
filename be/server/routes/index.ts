import { Router } from 'express';
import authRoutes from './auth.js';
import cplRoutes from './cpl.js';
import cplMappingRoutes from './cpl-mapping.js';
import mataKuliahRoutes from './mata-kuliah.js';
import dashboardRoutes from './dashboard.js';
import usersRoutes from './users.js';
import nilaiCplRoutes from './nilai-cpl.js';
import profileRoutes from './profile.js';
import transkripCplRoutes from './transkrip-cpl.js';
import transkripCpmkRoutes from './transkrip-cpmk.js';
import cpmkRoutes from './cpmk.js';
import cpmkMappingRoutes from './cpmk-mapping.js';
import teknikPenilaianRoutes from './teknik-penilaian.js';
import nilaiTeknikRoutes from './nilai-teknik.js';
import settingsRoutes from './settings.js';
import mataKuliahPengampuRoutes from './mata-kuliah-pengampu.js';
import kaprodiDataRoutes from './kaprodi-data.js';
import fakultasRoutes from './fakultas.js';
import prodiRoutes from './prodi.js';
import kurikulumRoutes from './kurikulum.js';
import jenisMataKuliahRoutes from './jenis-mata-kuliah.js';
import kategoriCplRoutes from './kategori-cpl.js';
import levelTaksonomiRoutes from './level-taksonomi.js';
import teknikPenilaianRefRoutes from './teknik-penilaian-ref.js';
import referencesRoutes from './references.js';
import rubrikRoutes from './rubrik.js';
import evaluasiRoutes from './evaluasi.js';
import angkatanRoutes from './angkatan.js';
import visiMisiRoutes from './visi-misi.js';
import profilLulusanRoutes from './profil-lulusan.js';
import kuesionerRoutes from './kuesioner.js';
import subCpmkRoutes from './sub-cpmk.js';
import transkripProfilRoutes from './transkrip-profil.js';
import roleAccessRoutes from './role-access.js';
import evaluasiCplRoutes from './evaluasi-cpl.js';
import defaultPermissionsRoutes from './default-permissions.js';
import tahunAjaranRoutes from './tahun-ajaran.js';
import jenjangRoutes from './jenjang.js';

import skalaNilaiRoutes from './skala-nilai.js';
import rolesRoutes from './roles.js';
import krsRoutes from './krs.js';

import { Request, Response, NextFunction } from 'express';
import { invalidateDashboardCache } from '../lib/dashboardCache.js';

const router = Router();

// ─── Auto-Invalidation Middleware ────────────────────────────────────────────
// Setiap write operation (POST/PUT/DELETE) ke rute data relevan otomatis
// mem-bump cache version di server, sehingga frontend dapat mendeteksinya
// tanpa perlu menambahkan signal manual ke setiap controller.
const DATA_MUTATION_ROUTES = [
    '/cpl', '/cpmk', '/cpmk-mapping', '/cpl-mata-kuliah',
    '/mata-kuliah', '/nilai-teknik', '/nilai-cpl',
    '/teknik-penilaian', '/sub-cpmk', '/krs',
    '/evaluasi', '/evaluasi-cpl', '/rubrik',
    '/angkatan', '/kurikulum', '/users',
];

function autoInvalidateDashboardCache(req: Request, res: Response, next: NextFunction) {
    // Only invalidate on write operations
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
        const path = req.path.replace(/^\//, ''); // strip leading slash
        const baseRoute = '/' + path.split('/')[0];
        if (DATA_MUTATION_ROUTES.includes(baseRoute)) {
            // Invalidate AFTER response is sent (non-blocking)
            res.on('finish', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    invalidateDashboardCache();
                }
            });
        }
    }
    next();
}

// Apply middleware to all data routes
router.use(autoInvalidateDashboardCache);

router.use('/auth', authRoutes);
router.use('/skala-nilai', skalaNilaiRoutes);
router.use('/jenjang', jenjangRoutes);
router.use('/cpl', cplRoutes);
router.use('/cpl-mata-kuliah', cplMappingRoutes);
router.use('/mata-kuliah', mataKuliahRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/nilai-cpl', nilaiCplRoutes);
router.use('/profiles', profileRoutes);
router.use('/transkrip-cpl', transkripCplRoutes);
router.use('/transkrip-cpmk', transkripCpmkRoutes);
router.use('/cpmk', cpmkRoutes);
router.use('/cpmk-mapping', cpmkMappingRoutes);
router.use('/teknik-penilaian', teknikPenilaianRoutes);
router.use('/nilai-teknik', nilaiTeknikRoutes);
router.use('/settings', settingsRoutes);
router.use('/mata-kuliah-pengampu', mataKuliahPengampuRoutes);
router.use('/kaprodi-data', kaprodiDataRoutes);
router.use('/fakultas', fakultasRoutes);
router.use('/prodi', prodiRoutes);
router.use('/kurikulum', kurikulumRoutes);
router.use('/jenis-mata-kuliah', jenisMataKuliahRoutes);
router.use('/kategori-cpl', kategoriCplRoutes);
router.use('/level-taksonomi', levelTaksonomiRoutes);
router.use('/teknik-penilaian-ref', teknikPenilaianRefRoutes);
router.use('/references', referencesRoutes);
router.use('/rubrik', rubrikRoutes);
router.use('/evaluasi', evaluasiRoutes);
router.use('/angkatan', angkatanRoutes);
router.use('/visi-misi', visiMisiRoutes);
router.use('/profil-lulusan', profilLulusanRoutes);
router.use('/kuesioner', kuesionerRoutes);
router.use('/sub-cpmk', subCpmkRoutes);
router.use('/transkrip-profil', transkripProfilRoutes);
router.use('/role-access', roleAccessRoutes);
router.use('/evaluasi-cpl', evaluasiCplRoutes);
router.use('/default-permissions', defaultPermissionsRoutes);
router.use('/tahun-ajaran', tahunAjaranRoutes);

router.use('/roles', rolesRoutes);
router.use('/krs', krsRoutes);

export default router;
