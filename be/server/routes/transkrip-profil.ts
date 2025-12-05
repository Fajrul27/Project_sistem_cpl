
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper to calculate weighted average for a list of NilaiCpl (Copied/Adapted from transkrip-cpl.ts)
function calculateCplScore(nilaiList: any[], weightMap: Map<string, number>) {
    if (nilaiList.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const n of nilaiList) {
        const key = `${n.cplId}-${n.mataKuliahId}`;
        const bobot = weightMap.get(key) ?? 1.0;
        const sks = n.mataKuliah?.sks ?? 0;
        const nilai = Number(n.nilai);

        totalWeightedScore += nilai * bobot * sks;
        totalWeight += bobot * sks;
    }

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
}

// GET /api/transkrip-profil/mahasiswa/:mahasiswaId
router.get('/mahasiswa/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { mahasiswaId } = req.params;

        // 1. Get Mahasiswa Profile to know Prodi
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            select: { prodiId: true }
        });

        if (!mahasiswa || !mahasiswa.prodiId) {
            return res.status(404).json({ error: 'Mahasiswa or Prodi not found' });
        }

        // 2. Get Profil Lulusan for this Prodi with CPL Mappings
        const profilLulusanList = await prisma.profilLulusan.findMany({
            where: { prodiId: mahasiswa.prodiId, isActive: true },
            include: {
                cplMappings: {
                    include: {
                        cpl: true
                    }
                }
            }
        });

        // 3. Get all NilaiCpl for this student
        const nilaiCplList = await prisma.nilaiCpl.findMany({
            where: { mahasiswaId },
            include: {
                mataKuliah: true
            }
        });

        // 4. Get Weights (CplMataKuliah)
        // We need weights for all CPLs involved. 
        // Optimization: Fetch all weights for the student's Prodi CPLs or just fetch all. 
        // Fetching all for simplicity or filtering by CPLs present in nilaiCplList.
        const cplIds = [...new Set(nilaiCplList.map(n => n.cplId))];
        const mkIds = [...new Set(nilaiCplList.map(n => n.mataKuliahId))];

        const weights = await prisma.cplMataKuliah.findMany({
            where: {
                cplId: { in: cplIds },
                mataKuliahId: { in: mkIds }
            }
        });

        const weightMap = new Map<string, number>();
        for (const w of weights) {
            weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi));
        }

        // 5. Group NilaiCpl by CPL ID
        const nilaiByCpl = new Map<string, any[]>();
        for (const nilai of nilaiCplList) {
            if (!nilaiByCpl.has(nilai.cplId)) {
                nilaiByCpl.set(nilai.cplId, []);
            }
            nilaiByCpl.get(nilai.cplId)!.push(nilai);
        }

        // 6. Calculate Score per CPL
        const cplScores = new Map<string, number>();
        for (const cplId of cplIds) {
            const score = calculateCplScore(nilaiByCpl.get(cplId) || [], weightMap);
            cplScores.set(cplId, score);
        }

        // 7. Calculate Score per Profil Lulusan
        const result = profilLulusanList.map(profil => {
            const mappings = profil.cplMappings;

            if (mappings.length === 0) {
                return {
                    ...profil,
                    percentage: 0,
                    status: 'Belum Ada CPL'
                };
            }

            let totalCplScore = 0;
            let cplCount = 0;

            for (const mapping of mappings) {
                const score = cplScores.get(mapping.cplId) || 0;
                totalCplScore += score;
                cplCount++;
            }

            const avgProfileScore = cplCount > 0 ? totalCplScore / cplCount : 0;

            return {
                ...profil,
                percentage: Number(avgProfileScore.toFixed(2)),
                status: avgProfileScore >= 70 ? 'Tercapai' : 'Dalam Proses' // Threshold example
            };
        });

        res.json(result);

    } catch (error) {
        console.error('Error calculating profil lulusan attainment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
