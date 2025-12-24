
import { prisma } from '../lib/prisma.js';
import { calculateNilaiCplFromCpmk, calculateNilaiCpmk } from '../lib/calculation.js';

export class TranskripService {
    // --- CPL Analysis & Transcript ---

    static async getAnalysis(semester?: number) {
        const where: any = {};
        if (semester) where.semester = semester;

        // 1. Get Average Score per CPL
        const aggregations = await prisma.nilaiCpl.groupBy({
            by: ['cplId'],
            _avg: { nilai: true },
            where
        });

        const cpls = await prisma.cpl.findMany({ select: { id: true, kodeCpl: true } });
        const cplMap = new Map(cpls.map(c => [c.id, c.kodeCpl]));

        const cplData = aggregations.map(agg => ({
            name: cplMap.get(agg.cplId) || 'Unknown',
            nilai: Number(agg._avg.nilai?.toFixed(2) || 0)
        })).sort((a, b) => a.name.localeCompare(b.name));

        // 2. Get Distribution Data
        const distributionRaw: any[] = semester
            ? await prisma.$queryRaw`
                SELECT
                  CASE
                    WHEN nilai >= 90 THEN '90-100'
                    WHEN nilai >= 80 THEN '80-89'
                    WHEN nilai >= 70 THEN '70-79'
                    WHEN nilai >= 60 THEN '60-69'
                    ELSE '0-59'
                  END as range_name,
                  COUNT(*) as count
                FROM nilai_cpl
                WHERE semester = ${semester}
                GROUP BY
                  CASE
                    WHEN nilai >= 90 THEN '90-100'
                    WHEN nilai >= 80 THEN '80-89'
                    WHEN nilai >= 70 THEN '70-79'
                    WHEN nilai >= 60 THEN '60-69'
                    ELSE '0-59'
                  END
            `
            : await prisma.$queryRaw`
                SELECT
                  CASE
                    WHEN nilai >= 90 THEN '90-100'
                    WHEN nilai >= 80 THEN '80-89'
                    WHEN nilai >= 70 THEN '70-79'
                    WHEN nilai >= 60 THEN '60-69'
                    ELSE '0-59'
                  END as range_name,
                  COUNT(*) as count
                FROM nilai_cpl
                GROUP BY
                  CASE
                    WHEN nilai >= 90 THEN '90-100'
                    WHEN nilai >= 80 THEN '80-89'
                    WHEN nilai >= 70 THEN '70-79'
                    WHEN nilai >= 60 THEN '60-69'
                    ELSE '0-59'
                  END
            `;

        const ranges = [
            { name: "0-59", min: 0, max: 59, count: 0 },
            { name: "60-69", min: 60, max: 69, count: 0 },
            { name: "70-79", min: 70, max: 79, count: 0 },
            { name: "80-89", min: 80, max: 89, count: 0 },
            { name: "90-100", min: 90, max: 100, count: 0 },
        ];

        for (const row of distributionRaw) {
            const range = ranges.find(r => r.name === row.range_name);
            if (range) range.count = Number(row.count);
        }

        // 3. Radar Data (Top 8)
        const radarData = [...cplData]
            .sort((a, b) => b.nilai - a.nilai)
            .slice(0, 8)
            .map(item => ({
                subject: item.name,
                nilai: item.nilai,
                fullMark: 100
            }));

        return { cplData, distributionData: ranges, radarData };
    }

    static async getTranskripCpl(mahasiswaId: string, semester?: number, tahunAjaran?: string) {
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            include: { prodi: true, angkatanRef: true }
        });
        if (!mahasiswa) throw new Error('MAHASISWA_NOT_FOUND');

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

        // console.log(`[Transkrip] Mahasiswa prodiId: ${mahasiswa.prodiId}`);
        // console.log(`[Transkrip] Found ${allCpls.length} CPLs in curriculum for this prodi`);

        const where: any = { mahasiswaId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        // console.log(`[Transkrip] Fetching for mahasiswa=${mahasiswaId}, semester=${semester}, tahunAjaran=${tahunAjaran}`);

        // PARALLEL FETCHING: Fetch unrelated data concurrently
        const [nilaiCplList, nilaiTeknikList] = await Promise.all([
            prisma.nilaiCpl.findMany({
                where,
                include: { cpl: true, mataKuliah: true }
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
                    mataKuliah: true
                },
                orderBy: [{ tahunAjaran: 'desc' }, { semester: 'desc' }]
            })
        ]);

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
        const minNilai = 70;

        // console.log(`[Transkrip] Processing ${allCpls.length} CPLs from curriculum`);
        // console.log(`[Transkrip] cplMap has ${cplMap.size} entries`);

        // Get unique CPL IDs from nilai_cpl records
        const cplIdsWithNilai = Array.from(cplMap.keys());

        // Fetch CPL details for those IDs
        const cplsWithNilai = await prisma.cpl.findMany({
            where: { id: { in: cplIdsWithNilai } },
            include: { kategoriRef: true }
        });

        // console.log(`[Transkrip] Found ${cplsWithNilai.length} CPLs with nilai records`);

        for (const cpl of cplsWithNilai) {
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
            const status = avgScore >= minNilai ? 'tercapai' : 'belum_tercapai';

            const latest = nilaiList.sort((a, b) => {
                if (a.tahunAjaran !== b.tahunAjaran) return a.tahunAjaran.localeCompare(b.tahunAjaran);
                return a.semester - b.semester;
            })[nilaiList.length - 1];

            transkrip.push({
                cplId: cpl.id,
                cpl: { ...cpl, kategori: cpl.kategoriRef?.nama || cpl.kategori },
                mataKuliahList: nilaiList.map(n => ({
                    id: n.mataKuliah.id,
                    kodeMk: n.mataKuliah.kodeMk,
                    namaMk: n.mataKuliah.namaMk
                })),
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
                    tahunAjaran: nt.tahunAjaran
                })),
                nilaiAkhir: Number(avgScore.toFixed(2)),
                status,
                semesterTercapai: latest?.semester || 0,
                tahunAjaran: latest?.tahunAjaran || '-'
            });
        }

        const stats = {
            totalCpl: transkrip.length,
            totalCurriculumCpl: allCpls.length,
            tercapai: transkrip.filter(t => t.status === 'tercapai').length,
            belumTercapai: transkrip.filter(t => t.status === 'belum_tercapai').length,
            avgScore: Number((transkrip.reduce((s, t) => s + t.nilaiAkhir, 0) / (transkrip.length || 1)).toFixed(2))
        };
        (stats as any).persentaseTercapai = stats.totalCpl > 0 ? Number(((stats.tercapai / stats.totalCpl) * 100).toFixed(2)) : 0;

        // console.log(`[Transkrip] Returning ${transkrip.length} items to frontend`);
        /*
        if (transkrip.length > 0) {
            console.log(`[Transkrip] Sample item:`, {
                cplId: transkrip[0].cplId,
                kodeCpl: transkrip[0].cpl?.kodeCpl,
                nilaiAkhir: transkrip[0].nilaiAkhir,
                status: transkrip[0].status,
                mataKuliahCount: transkrip[0].mataKuliahList?.length
            });
        }
        */

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
                    kodeMk: nt.mataKuliah?.kodeMk,
                    namaMk: nt.mataKuliah?.namaMk
                },
                semester: nt.semester,
                tahunAjaran: nt.tahunAjaran
            }))
        };
    }

    static async calculateTranskrip(mahasiswaId: string) {
        const activeMks = await prisma.nilaiTeknikPenilaian.findMany({
            where: { mahasiswaId },
            select: { mataKuliahId: true, semester: true, tahunAjaran: true },
            distinct: ['mataKuliahId', 'semester', 'tahunAjaran']
        });

        const cpmkMks = await prisma.nilaiCpmk.findMany({
            where: { mahasiswaId },
            select: { mataKuliahId: true, semester: true, tahunAjaran: true },
            distinct: ['mataKuliahId', 'semester', 'tahunAjaran']
        });

        const targets = [...activeMks, ...cpmkMks].filter((v, i, a) =>
            a.findIndex(t => t.mataKuliahId === v.mataKuliahId && t.semester === v.semester && t.tahunAjaran === v.tahunAjaran) === i
        );

        let processed = 0;

        // BATCH PROCESSING: Process 5 targets at a time to avoid connection pool exhaustion
        const BATCH_SIZE = 5;
        for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            const batch = targets.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (target) => {
                const cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId: target.mataKuliahId } });

                // Keep sub-tasks sequential per target to maintain logic dependency (CPL depends on CPMK)
                for (const cpmk of cpmks) {
                    await calculateNilaiCpmk(mahasiswaId, cpmk.id, target.mataKuliahId, target.semester, target.tahunAjaran);
                }
                await calculateNilaiCplFromCpmk(mahasiswaId, target.mataKuliahId, target.semester, target.tahunAjaran);
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

        const where: any = { mahasiswaId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        const nilaiCpmkList = await prisma.nilaiCpmk.findMany({
            where,
            include: { cpmk: true, mataKuliah: true },
            orderBy: [
                { semester: 'asc' },
                { mataKuliah: { kodeMk: 'asc' } },
                { cpmk: { kodeCpmk: 'asc' } }
            ]
        });

        const transkrip = nilaiCpmkList.map((item: any) => ({
            id: item.id,
            kodeCpmk: item.cpmk.kodeCpmk,
            deskripsi: item.cpmk.deskripsi,
            nilai: Number(item.nilaiAkhir),
            status: item.nilaiAkhir >= 70 ? 'tercapai' : 'belum_tercapai',
            mataKuliah: {
                kodeMk: item.mataKuliah.kodeMk,
                namaMk: item.mataKuliah.namaMk,
                sks: item.mataKuliah.sks,
                semester: item.semester
            },
            tahunAjaran: item.tahunAjaran
        }));

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

        const nilaiCplList = await prisma.nilaiCpl.findMany({
            where: { mahasiswaId },
            include: { mataKuliah: true }
        });

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
            console.log(`[Transkrip] ${profil.kode} - Name: ${profil.nama}`);
            console.log(`[Transkrip] ${profil.kode} - Target DB: ${profil.targetKetercapaian} (Type: ${typeof profil.targetKetercapaian})`);
            console.log(`[Transkrip] ${profil.kode} - Score: ${avgProfileScore} (Type: ${typeof avgProfileScore})`);

            return {
                ...profil,
                percentage: Number(avgProfileScore.toFixed(2)),
                status: avgProfileScore >= (profil.targetKetercapaian || 70) ? 'Tercapai' : 'Belum Tercapai'
            };
        });
    }
}
