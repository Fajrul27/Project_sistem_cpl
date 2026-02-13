
import { prisma } from '../lib/prisma.js';
import { calculateNilaiCplFromCpmk, calculateNilaiCpmk } from '../lib/calculation.js';

export class TranskripService {
    // --- CPL Analysis & Transcript ---

    static async getAnalysis(filters: { semester?: number; fakultasId?: string; prodiId?: string; angkatan?: string }) {
        const where: any = {};
        const { semester, fakultasId, prodiId, angkatan } = filters;

        if (semester) where.semester = semester;

        // Relation filters for Mahasiswa
        if (fakultasId || prodiId || angkatan) {
            where.mahasiswa = {};
            if (fakultasId) where.mahasiswa.fakultasId = fakultasId;
            if (prodiId) where.mahasiswa.prodiId = prodiId;
            if (angkatan) where.mahasiswa.angkatanRef = { tahun: parseInt(angkatan) };
        }

        // 1. Get Average Score per CPL & Distribution
        // Analysis Requirement: "How well are students achieving each CPL?" NOT "How high are course grades?"
        // So we must calculate:
        // A. For each Student x CPL: Calculate Weighted Average of contributing courses (filtering best score if retaken).
        // B. Aggregate these Student-CPL scores for:
        //    - Average CPL Score (Avg of all students' scores for that CPL)
        //    - Distribution (Count of students in each grade range for that CPL, averaged across all CPLs or keeping CPL distinct? Usually per CPL).

        // Step 1: Fetch all Raw Data
        const rawData = await prisma.nilaiCpl.findMany({
            where,
            select: {
                cplId: true,
                mataKuliahId: true,
                mahasiswaId: true,
                nilai: true,
                mataKuliah: { select: { sks: true } }
            }
        });

        // Step A: Deduplicate to find Best Score per (Mahasiswa, Mata Kuliah, CPL)
        const bestScoreMap = new Map<string, typeof rawData[0]>();

        for (const r of rawData) {
            const key = `${r.mahasiswaId}-${r.mataKuliahId}-${r.cplId}`;
            const currentVal = Number(r.nilai);
            if (!bestScoreMap.has(key) || currentVal > Number(bestScoreMap.get(key)!.nilai)) {
                bestScoreMap.set(key, r);
            }
        }

        // Step 2: Fetch Weights (CPL-MK mapping)
        const allCplIds = [...new Set(rawData.map(r => r.cplId))];
        const allMkIds = [...new Set(rawData.map(r => r.mataKuliahId))];

        const weightMappings = await prisma.cplMataKuliah.findMany({
            where: {
                cplId: { in: allCplIds },
                mataKuliahId: { in: allMkIds }
            },
            select: { cplId: true, mataKuliahId: true, bobotKontribusi: true }
        });

        const weightMap = new Map<string, number>();
        for (const w of weightMappings) {
            weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi));
        }

        // Step 3: Calculate Student-CPL Score (Weighted Average)
        const studentCplMap = new Map<string, { totalWeightedScore: number; totalWeight: number }>();

        for (const record of bestScoreMap.values()) {
            const studentCplKey = `${record.mahasiswaId}-${record.cplId}`;
            const weightKey = `${record.cplId}-${record.mataKuliahId}`;

            const bobot = weightMap.get(weightKey) ?? 1.0;
            const sks = record.mataKuliah?.sks || 0;
            const nilai = Number(record.nilai);

            if (!studentCplMap.has(studentCplKey)) {
                studentCplMap.set(studentCplKey, { totalWeightedScore: 0, totalWeight: 0 });
            }

            const entry = studentCplMap.get(studentCplKey)!;
            entry.totalWeightedScore += nilai * bobot * sks;
            entry.totalWeight += bobot * sks;
        }

        // Step 4: Aggregate per CPL
        const cplScoresList = new Map<string, number[]>();

        for (const [key, data] of studentCplMap.entries()) {
            const cplId = key.split('-')[1];
            const finalScore = data.totalWeight > 0 ? data.totalWeightedScore / data.totalWeight : 0;

            if (!cplScoresList.has(cplId)) cplScoresList.set(cplId, []);
            cplScoresList.get(cplId)!.push(finalScore);
        }

        const aggregations = [];
        const allFinalScores: number[] = [];

        for (const [cplId, scores] of cplScoresList.entries()) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            aggregations.push({ cplId, _avg: { nilai: avg }, count: scores.length });
            allFinalScores.push(...scores);
        }

        const cplWhere: any = { isActive: true };
        if (prodiId) {
            cplWhere.OR = [{ prodiId }, { prodiId: null }];
        }

        const cpls = await prisma.cpl.findMany({
            where: cplWhere,
            select: { id: true, kodeCpl: true, deskripsi: true }
        });

        const cplData = cpls.map(cpl => {
            const scores = cplScoresList.get(cpl.id);
            const avg = scores && scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : 0;

            return {
                name: cpl.kodeCpl,
                description: cpl.deskripsi,
                nilai: Number(avg.toFixed(2))
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        // Distribution of Student CPL Achievements (Not raw course grades)
        const distributionRanges = [
            { name: "0-59", min: 0, max: 59 },
            { name: "60-69", min: 60, max: 69 },
            { name: "70-79", min: 70, max: 79 },
            { name: "80-89", min: 80, max: 89 },
            { name: "90-100", min: 90, max: 100 },
        ];

        const distributionData = distributionRanges.map(r => {
            const count = allFinalScores.filter(s => s >= r.min && s <= r.max).length;
            return { ...r, count };
        });

        // 3. Radar Data (Top 8)
        const radarData = [...cplData]
            .sort((a, b) => b.nilai - a.nilai)
            .slice(0, 8)
            .map(item => ({
                subject: item.name,
                nilai: item.nilai,
                fullMark: 100
            }));

        return { cplData, distributionData, radarData };
    }

    // --- Helper: Get Grade from Scale ---
    private static getGradeFromScale(score: number, scale: any[]): { huruf: string; isLulus: boolean } {
        const found = scale.find(s => score >= s.nilaiMin);
        if (found) return { huruf: found.huruf, isLulus: found.isLulus };
        return { huruf: 'E', isLulus: false }; // Default fallback
    }

    static async getTranskripCpl(mahasiswaId: string, semester?: number, tahunAjaran?: string) {
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            include: { prodi: true, angkatanRef: true }
        });
        console.log(`[TranskripService] Fetching transkrip for ID: ${mahasiswaId}, found:`, mahasiswa ? `Found (Prodi: ${mahasiswa.prodiId}, Semester: ${mahasiswa.semester})` : 'Not Found');
        if (!mahasiswa) throw new Error('MAHASISWA_NOT_FOUND');

        // Fetch Active Grade Scale
        const skalaNilaiList = await prisma.skalaNilai.findMany({
            where: { isActive: true },
            orderBy: { nilaiMin: 'desc' }
        });

        const allCpls = await prisma.cpl.findMany({
            where: {
                isActive: true,
                OR: [
                    { prodiId: mahasiswa.prodiId },
                    { prodiId: null }
                ]
            },
            include: { kategoriRef: true },
            orderBy: { kodeCpl: 'asc' }
        });


        const where: any = { mahasiswaId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaranId = tahunAjaran;

        const krsWhere: any = { mahasiswaId };
        if (semester) krsWhere.semester = { angka: semester };
        if (tahunAjaran) krsWhere.tahunAjaranId = tahunAjaran;

        const [nilaiCplListRaw, nilaiTeknikList, krsCount] = await Promise.all([
            prisma.nilaiCpl.findMany({
                where,
                include: { cpl: true, mataKuliah: true, tahunAjaranRef: true }
            }),
            prisma.nilaiTeknikPenilaian.findMany({
                where,
                include: {
                    teknikPenilaian: {
                        include: {
                            cpmk: {
                                include: {
                                    cplMappings: { include: { cpl: true } }
                                }
                            }
                        }
                    },
                    mataKuliah: true,
                    tahunAjaranRef: true
                },
                orderBy: [{ tahunAjaranRef: { nama: 'desc' } }, { semester: 'desc' }]
            }),
            prisma.krs.count({ where: krsWhere })
        ]);

        let effectiveMkCount = krsCount;
        if (effectiveMkCount === 0) {
            const mkWhere: any = { isActive: true };
            if (semester) mkWhere.semester = semester;
            else if (mahasiswa.semester) mkWhere.semester = mahasiswa.semester;

            if (mahasiswa.angkatanRef?.kurikulumId) {
                mkWhere.kurikulumId = mahasiswa.angkatanRef.kurikulumId;
            }

            if (mahasiswa.prodiId) {
                mkWhere.prodiId = mahasiswa.prodiId;
            }

            effectiveMkCount = await prisma.mataKuliah.count({ where: mkWhere });
        }

        // Filter out orphan records (missing CPL or MataKuliah) to prevent crashes
        const rawNilaiCplList = nilaiCplListRaw.filter(n => n.cpl && n.mataKuliah);

        // BEST SCORE LOGIC:
        // If a student retakes a course, we should only count the BEST attempt for CPL calculation.
        // We group by CPL + Mata Kuliah and pick the highest score.
        const bestNilaiMap = new Map<string, typeof rawNilaiCplList[0]>();

        for (const record of rawNilaiCplList) {
            const key = `${record.cplId}-${record.mataKuliahId}`;
            if (!bestNilaiMap.has(key)) {
                bestNilaiMap.set(key, record);
            } else {
                const existing = bestNilaiMap.get(key)!;
                if (Number(record.nilai) > Number(existing.nilai)) {
                    bestNilaiMap.set(key, record);
                }
            }
        }

        const nilaiCplList = Array.from(bestNilaiMap.values());

        const cplIds = [...new Set(nilaiCplList.map(n => n.cplId))];
        const mkIds = [...new Set(nilaiCplList.map(n => n.mataKuliahId))];

        const weights = await prisma.cplMataKuliah.findMany({
            where: {
                cplId: { in: cplIds },
                mataKuliahId: { in: mkIds }
            }
        });

        const weightMap = new Map<string, number>();
        weights.forEach(w => weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi)));

        const cplMap = new Map<string, any[]>();
        nilaiCplList.forEach(n => {
            if (!cplMap.has(n.cplId)) cplMap.set(n.cplId, []);
            cplMap.get(n.cplId)!.push(n);
        });

        const transkrip: any[] = [];

        // Get unique CPL IDs from nilai_cpl records
        const cplIdsWithNilai = Array.from(cplMap.keys());

        // Fetch CPL details for those IDs
        const cplsWithNilai = await prisma.cpl.findMany({
            where: { id: { in: cplIdsWithNilai } },
            include: { kategoriRef: true }
        });


        for (const cpl of allCpls) {
            const nilaiList = cplMap.get(cpl.id) || [];
            let totalWeightedScore = 0;
            let totalWeight = 0;

            // Get technical assessments that map to this CPL
            const relatedTeknik = nilaiTeknikList.filter(nt =>
                nt.teknikPenilaian?.cpmk?.cplMappings?.some((mapping: any) => mapping.cplId === cpl.id)
            );

            if (nilaiList.length > 0) {
                for (const n of nilaiList) {
                    const key = `${cpl.id}-${n.mataKuliahId}`;
                    const bobot = weightMap.get(key) ?? 1.0;
                    const sks = n.mataKuliah?.sks || 0;
                    const nilai = Number(n.nilai);
                    totalWeightedScore += nilai * bobot * sks;
                    totalWeight += bobot * sks;
                }
            }

            const avgScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

            // DYNAMIC GRADE CALCULATION
            const gradeInfo = TranskripService.getGradeFromScale(avgScore, skalaNilaiList);
            const status = gradeInfo.isLulus ? 'tercapai' : 'belum_tercapai';

            const latest = nilaiList.sort((a, b) => {
                const taA = a.tahunAjaranRef?.nama || '';
                const taB = b.tahunAjaranRef?.nama || '';
                if (taA !== taB) return taA.localeCompare(taB);
                return a.semester - b.semester;
            })[nilaiList.length - 1];

            transkrip.push({
                cplId: cpl.id,
                cpl: { ...cpl, kategori: cpl.kategoriRef?.nama || cpl.kategori },
                mataKuliahList: nilaiList.map(n => {
                    const key = `${cpl.id}-${n.mataKuliahId}`;
                    return {
                        id: n.mataKuliah.id,
                        kodeMk: n.mataKuliah.kodeMk,
                        namaMk: n.mataKuliah.namaMk,
                        nilai: Number(n.nilai),
                        sks: n.mataKuliah.sks,
                        semester: n.mataKuliah.semester,
                        bobot: weightMap.get(key) ?? 1 // Default to 1 to match calculation logic
                    };
                }),
                // Include technical assessments that contributed to this CPL
                penilaianTeknik: relatedTeknik.map(nt => ({
                    id: nt.id,
                    nilai: Number(nt.nilai),
                    teknikPenilaian: nt.teknikPenilaian?.namaTeknik || 'N/A',
                    mataKuliah: {
                        kodeMk: nt.mataKuliah?.kodeMk,
                        namaMk: nt.mataKuliah?.namaMk
                    },
                    semester: nt.semester,
                    tahunAjaran: nt.tahunAjaranRef?.nama || '-'
                })),
                nilaiAkhir: Number(avgScore.toFixed(2)),
                huruf: gradeInfo.huruf, // ADDED
                status,
                semesterTercapai: latest?.semester || 0,
                tahunAjaran: latest?.tahunAjaranRef?.nama || '-'
            });
        }

        const stats = {
            totalCpl: transkrip.filter(t => t.mataKuliahList.length > 0).length,
            totalCurriculumCpl: allCpls.length,
            totalMataKuliah: effectiveMkCount,
            tercapai: transkrip.filter(t => t.status === 'tercapai' && t.mataKuliahList.length > 0).length,
            belumTercapai: transkrip.filter(t => (t.status === 'belum_tercapai' || t.mataKuliahList.length === 0)).length,
            avgScore: Number((transkrip.reduce((s, t) => s + t.nilaiAkhir, 0) / (transkrip.length || 1)).toFixed(2))
        };
        (stats as any).persentaseTercapai = stats.totalCurriculumCpl > 0 ? Number(((stats.tercapai / stats.totalCurriculumCpl) * 100).toFixed(2)) : 0;

        return {
            mahasiswa,
            transkrip,
            summary: stats,
            // Include raw technical assessment data for additional display
            penilaianTeknikList: nilaiTeknikList.map(nt => ({
                id: nt.id,
                nilai: Number(nt.nilai),
                teknikPenilaian: nt.teknikPenilaian?.namaTeknik || 'N/A',
                mataKuliah: {
                    id: nt.mataKuliahId,
                    kodeMk: nt.mataKuliah?.kodeMk,
                    namaMk: nt.mataKuliah?.namaMk
                },
                semester: nt.semester,

                tahunAjaran: nt.tahunAjaranRef?.nama || '-'
            })),
            profilLulusan: await TranskripService.getTranskripProfil(mahasiswaId)
        };
    }

    static async calculateTranskrip(mahasiswaId: string) {
        const activeMks = await prisma.nilaiTeknikPenilaian.findMany({
            where: { mahasiswaId },
            select: { mataKuliahId: true, semester: true, tahunAjaranId: true },
            distinct: ['mataKuliahId', 'semester', 'tahunAjaranId']
        });

        const cpmkMks = await prisma.nilaiCpmk.findMany({
            where: { mahasiswaId },
            select: { mataKuliahId: true, semester: true, tahunAjaranId: true },
            distinct: ['mataKuliahId', 'semester', 'tahunAjaranId']
        });

        const targets = [...activeMks, ...cpmkMks]
            .filter((t): t is typeof t & { tahunAjaranId: string } => t.tahunAjaranId !== null)
            .filter((v, i, a) =>
                a.findIndex(t => t.mataKuliahId === v.mataKuliahId && t.semester === v.semester && t.tahunAjaranId === v.tahunAjaranId) === i
            );

        let processed = 0;

        // BATCH PROCESSING: Process 5 targets at a time to avoid connection pool exhaustion
        const BATCH_SIZE = 5;
        for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            const batch = targets.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (target) => {
                const cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId: target.mataKuliahId } });

                for (const cpmk of cpmks) {
                    await calculateNilaiCpmk(mahasiswaId, cpmk.id, target.mataKuliahId, target.semester, target.tahunAjaranId as string);
                }
                await calculateNilaiCplFromCpmk(mahasiswaId, target.mataKuliahId, target.semester, target.tahunAjaranId as string);
            }));
            processed += batch.length;
        }
        return processed;
    }


    // --- CPMK Transcript ---

    static async getTranskripCpmk(mahasiswaId: string, semester?: number, tahunAjaran?: string) {
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            include: { prodi: true, angkatanRef: true }
        });
        if (!mahasiswa) throw new Error('MAHASISWA_NOT_FOUND');

        // Fetch Active Grade Scale
        const skalaNilaiList = await prisma.skalaNilai.findMany({
            where: { isActive: true },
            orderBy: { nilaiMin: 'desc' }
        });

        const where: any = { mahasiswaId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaranId = tahunAjaran;

        const nilaiCpmkList = (await prisma.nilaiCpmk.findMany({
            where,
            include: { cpmk: true, mataKuliah: true, tahunAjaranRef: true },
            orderBy: [
                { semester: 'asc' },
                { mataKuliah: { kodeMk: 'asc' } },
                { cpmk: { kodeCpmk: 'asc' } }
            ]
        })).filter((item: any) => item.cpmk && item.mataKuliah);

        const transkrip = nilaiCpmkList.map((item: any) => {
            const nilaiAkhir = Number(item.nilaiAkhir);
            const gradeInfo = TranskripService.getGradeFromScale(nilaiAkhir, skalaNilaiList);

            return {
                id: item.id,
                kodeCpmk: item.cpmk.kodeCpmk,
                deskripsi: item.cpmk.deskripsi,
                nilai: nilaiAkhir,
                huruf: gradeInfo.huruf, // ADDED
                status: gradeInfo.isLulus ? 'tercapai' : 'belum_tercapai',
                mataKuliah: {
                    kodeMk: item.mataKuliah.kodeMk,
                    namaMk: item.mataKuliah.namaMk,
                    sks: item.mataKuliah.sks,
                    semester: item.semester

                },
                tahunAjaran: item.tahunAjaranRef?.nama || '-'
            };
        });

        return {
            mahasiswa: {
                userId: mahasiswa.userId,
                namaLengkap: mahasiswa.namaLengkap,
                nim: mahasiswa.nim,
                programStudi: mahasiswa.prodi?.nama || mahasiswa.programStudi,
                semester: mahasiswa.semester,
                tahunMasuk: mahasiswa.tahunMasuk,
                angkatanRef: mahasiswa.angkatanRef
            },
            transkrip
        };
    }


    // --- Profil Lulusan Transcript ---

    static async getTranskripProfil(mahasiswaId: string) {
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            select: { prodiId: true }
        });
        if (!mahasiswa || !mahasiswa.prodiId) throw new Error('MAHASISWA_OR_PRODI_NOT_FOUND');

        const profilLulusanList = await prisma.profilLulusan.findMany({
            where: { prodiId: mahasiswa.prodiId, isActive: true },
            include: { cplMappings: { include: { cpl: true } } }
        });

        const rawNilaiCplList = (await prisma.nilaiCpl.findMany({
            where: { mahasiswaId },
            include: { mataKuliah: true }
        })).filter(n => n.mataKuliah);

        // BEST SCORE LOGIC:
        // Pick best score per CPL-MataKuliah pair
        const bestNilaiMap = new Map<string, typeof rawNilaiCplList[0]>();

        for (const record of rawNilaiCplList) {
            const key = `${record.cplId}-${record.mataKuliahId}`;
            if (!bestNilaiMap.has(key)) {
                bestNilaiMap.set(key, record);
            } else {
                const existing = bestNilaiMap.get(key)!;
                if (Number(record.nilai) > Number(existing.nilai)) {
                    bestNilaiMap.set(key, record);
                }
            }
        }
        const nilaiCplList = Array.from(bestNilaiMap.values());

        const cplIds = [...new Set(nilaiCplList.map(n => n.cplId))];
        const mkIds = [...new Set(nilaiCplList.map(n => n.mataKuliahId))];

        const weights = await prisma.cplMataKuliah.findMany({
            where: {
                cplId: { in: cplIds },
                mataKuliahId: { in: mkIds }
            }
        });

        const weightMap = new Map<string, number>();
        weights.forEach(w => weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi)));

        const nilaiByCpl = new Map<string, any[]>();
        for (const nilai of nilaiCplList) {
            if (!nilaiByCpl.has(nilai.cplId)) nilaiByCpl.set(nilai.cplId, []);
            nilaiByCpl.get(nilai.cplId)!.push(nilai);
        }

        const cplScores = new Map<string, number>();
        for (const cplId of cplIds) {
            // Helper logic inline
            const nilaiList = nilaiByCpl.get(cplId) || [];
            let totalWeightedScore = 0;
            let totalWeight = 0;

            for (const n of nilaiList) {
                const key = `${n.cplId}-${n.mataKuliahId}`;
                const bobot = weightMap.get(key) ?? 1.0;
                const sks = n.mataKuliah?.sks || 0;
                const nilai = Number(n.nilai);
                totalWeightedScore += nilai * bobot * sks;
                totalWeight += bobot * sks;
            }

            const score = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
            cplScores.set(cplId, score);
        }

        return profilLulusanList.map(profil => {
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

            // DEBUG LOGGING

            return {
                ...profil,
                percentage: Number(avgProfileScore.toFixed(2)),
                status: avgProfileScore >= (profil.targetKetercapaian || 70) ? 'Tercapai' : 'Belum Tercapai'
            };
        });
    }
}
