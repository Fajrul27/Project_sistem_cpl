// ============================================
// Transkrip CPL Routes
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// Helper to calculate weighted average for a list of NilaiCpl
async function calculateCplScore(nilaiList, cplId) {
    if (nilaiList.length === 0)
        return { nilai: 0, status: 'belum_tercapai' };
    // Get bobot kontribusi for each mata kuliah
    const nilaiWithWeights = await Promise.all(nilaiList.map(async (n) => {
        const mapping = await prisma.cplMataKuliah.findFirst({
            where: {
                cplId,
                mataKuliahId: n.mataKuliahId
            }
        });
        return {
            nilai: Number(n.nilai),
            bobotKontribusi: mapping ? Number(mapping.bobotKontribusi) : 1.0,
            sks: n.mataKuliah.sks,
            semester: n.semester,
            tahunAjaran: n.tahunAjaran
        };
    }));
    // Calculate weighted average: Σ(nilai × bobot × SKS) / Σ(bobot × SKS)
    const totalWeightedScore = nilaiWithWeights.reduce((sum, n) => sum + (n.nilai * n.bobotKontribusi * n.sks), 0);
    const totalWeight = nilaiWithWeights.reduce((sum, n) => sum + (n.bobotKontribusi * n.sks), 0);
    const avgScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    // Get minimum nilai tercapai from CPL
    const cpl = await prisma.cpl.findUnique({
        where: { id: cplId }
    });
    const minNilai = cpl?.minimalNilaiTercapai ? Number(cpl.minimalNilaiTercapai) : 70;
    const status = avgScore >= minNilai ? 'tercapai' : 'belum_tercapai';
    // Get latest semester info
    const latest = nilaiList.sort((a, b) => {
        if (a.tahunAjaran !== b.tahunAjaran)
            return a.tahunAjaran.localeCompare(b.tahunAjaran);
        return a.semester - b.semester;
    })[nilaiList.length - 1];
    return {
        nilaiAkhir: Number(avgScore.toFixed(2)),
        status,
        semesterTercapai: latest.semester,
        tahunAjaran: latest.tahunAjaran
    };
}
// GET /api/transkrip-cpl - Get all transkrip records (Aggregated)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { mahasiswaId } = req.query;
        const whereClause = {};
        if (mahasiswaId)
            whereClause.mahasiswaId = mahasiswaId;
        // Get all NilaiCpl
        const nilaiCplList = await prisma.nilaiCpl.findMany({
            where: whereClause,
            include: {
                mahasiswa: true,
                cpl: true,
                mataKuliah: true
            }
        });
        // Group by Mahasiswa -> CPL
        const grouped = new Map();
        for (const nilai of nilaiCplList) {
            if (!grouped.has(nilai.mahasiswaId)) {
                grouped.set(nilai.mahasiswaId, new Map());
            }
            const mMap = grouped.get(nilai.mahasiswaId);
            if (!mMap.has(nilai.cplId)) {
                mMap.set(nilai.cplId, []);
            }
            mMap.get(nilai.cplId).push(nilai);
        }
        const result = [];
        for (const [mId, cplMap] of grouped.entries()) {
            for (const [cplId, nilaiList] of cplMap.entries()) {
                const calc = await calculateCplScore(nilaiList, cplId);
                const first = nilaiList[0];
                result.push({
                    mahasiswaId: mId,
                    cplId,
                    mahasiswa: first.mahasiswa,
                    cpl: first.cpl,
                    ...calc
                });
            }
        }
        res.json({
            success: true,
            data: result,
            count: result.length
        });
    }
    catch (error) {
        console.error('Error fetching transkrip:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// GET /api/transkrip-cpl/:mahasiswaId - Get transkrip by mahasiswa
router.get('/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        // Get all CPLs to ensure we show even those with no score (optional, but good for transcript)
        const allCpls = await prisma.cpl.findMany({
            where: { isActive: true },
            orderBy: { kodeCpl: 'asc' }
        });
        // Get all NilaiCpl for this student
        const nilaiCplList = await prisma.nilaiCpl.findMany({
            where: { mahasiswaId },
            include: {
                cpl: true,
                mataKuliah: true
            }
        });
        // Group by CPL
        const cplMap = new Map();
        for (const nilai of nilaiCplList) {
            if (!cplMap.has(nilai.cplId)) {
                cplMap.set(nilai.cplId, []);
            }
            cplMap.get(nilai.cplId).push(nilai);
        }
        const transkrip = [];
        for (const cpl of allCpls) {
            const nilaiList = cplMap.get(cpl.id) || [];
            let calc;
            if (nilaiList.length > 0) {
                calc = await calculateCplScore(nilaiList, cpl.id);
            }
            else {
                calc = {
                    nilaiAkhir: 0,
                    status: 'belum_tercapai',
                    semesterTercapai: 0,
                    tahunAjaran: '-'
                };
            }
            transkrip.push({
                cplId: cpl.id,
                cpl,
                ...calc
            });
        }
        // Calculate summary
        const totalCpl = transkrip.length;
        const tercapai = transkrip.filter(t => t.status === 'tercapai').length;
        const belumTercapai = transkrip.filter(t => t.status === 'belum_tercapai').length;
        const avgScore = transkrip.reduce((sum, t) => sum + Number(t.nilaiAkhir), 0) / totalCpl || 0;
        // Get mahasiswa info
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId }
        });
        res.json({
            success: true,
            data: {
                mahasiswa,
                transkrip,
                summary: {
                    totalCpl,
                    tercapai,
                    belumTercapai,
                    proses: 0, // Deprecated logic
                    avgScore: Number(avgScore.toFixed(2)),
                    persentaseTercapai: totalCpl > 0 ? Number(((tercapai / totalCpl) * 100).toFixed(2)) : 0
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching mahasiswa transkrip:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
// POST /api/transkrip-cpl/calculate - Trigger calculation (Just returns data now)
router.post('/calculate', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { mahasiswaId } = req.body;
        // Redirect to GET logic
        res.redirect(307, `/api/transkrip-cpl/${mahasiswaId}`);
    }
    catch (error) {
        res.status(500).json({ error: 'Calculation error' });
    }
});
export default router;
