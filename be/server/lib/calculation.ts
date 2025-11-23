import { prisma } from './prisma.js';

// Helper function: Calculate Nilai CPMK from Teknik Penilaian
export async function calculateNilaiCpmk(
    mahasiswaId: string,
    cpmkId: string,
    mataKuliahId: string,
    semester: number,
    tahunAjaran: string
) {
    try {
        // Get all teknik penilaian for this CPMK
        const teknikList = await prisma.teknikPenilaian.findMany({
            where: { cpmkId }
        });

        // Get nilai for each teknik
        const nilaiList = await Promise.all(
            teknikList.map(async (teknik) => {
                const nilai = await prisma.nilaiTeknikPenilaian.findFirst({
                    where: {
                        mahasiswaId,
                        teknikPenilaianId: teknik.id,
                        semester,
                        tahunAjaran
                    }
                });

                return nilai ? {
                    nilai: Number(nilai.nilai),
                    bobot: Number(teknik.bobotPersentase)
                } : null;
            })
        );

        // Filter out null values
        const validNilai = nilaiList.filter(n => n !== null) as Array<{ nilai: number; bobot: number }>;

        // Check if all teknik have nilai
        if (validNilai.length === 0) {
            // No nilai entered yet, delete existing calculated CPMK nilai if any
            await prisma.nilaiCpmk.deleteMany({
                where: {
                    mahasiswaId,
                    cpmkId,
                    semester,
                    tahunAjaran
                }
            });
            return;
        }

        // Calculate weighted average: Σ(nilai × bobot) / 100
        const totalWeighted = validNilai.reduce((sum, n) => sum + (n.nilai * n.bobot / 100), 0);

        // Upsert NilaiCpmk
        await prisma.nilaiCpmk.upsert({
            where: {
                mahasiswaId_cpmkId_semester_tahunAjaran: {
                    mahasiswaId,
                    cpmkId,
                    semester,
                    tahunAjaran
                }
            },
            update: {
                nilaiAkhir: totalWeighted,
                calculatedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                cpmkId,
                mataKuliahId,
                nilaiAkhir: totalWeighted,
                semester,
                tahunAjaran
            }
        });

        // Trigger calculation of CPL nilai
        await calculateNilaiCplFromCpmk(mahasiswaId, mataKuliahId, semester, tahunAjaran);
    } catch (error) {
        console.error('Calculate nilai CPMK error:', error);
        // Don't throw, just log
    }
}

// Helper function: Calculate Nilai CPL from CPMK
export async function calculateNilaiCplFromCpmk(
    mahasiswaId: string,
    mataKuliahId: string,
    semester: number,
    tahunAjaran: string
) {
    try {
        // Get all CPMK for this mata kuliah
        const cpmkList = await prisma.cpmk.findMany({
            where: { mataKuliahId },
            include: {
                cplMappings: true,
                nilaiCpmk: {
                    where: {
                        mahasiswaId,
                        semester,
                        tahunAjaran
                    }
                }
            }
        });

        // Group by CPL
        const cplNilaiMap = new Map<string, Array<{ nilai: number; bobot: number }>>();

        for (const cpmk of cpmkList) {
            const nilaiCpmk = cpmk.nilaiCpmk[0];
            if (!nilaiCpmk) continue; // Skip if no nilai yet

            for (const mapping of cpmk.cplMappings) {
                if (!cplNilaiMap.has(mapping.cplId)) {
                    cplNilaiMap.set(mapping.cplId, []);
                }

                cplNilaiMap.get(mapping.cplId)!.push({
                    nilai: Number(nilaiCpmk.nilaiAkhir),
                    bobot: Number(mapping.bobotPersentase)
                });
            }
        }

        // Calculate and upsert nilai CPL for each CPL
        for (const [cplId, nilaiArray] of cplNilaiMap.entries()) {
            // Calculate: Σ(nilai CPMK × bobot mapping) / 100
            const totalWeighted = nilaiArray.reduce((sum, n) => sum + (n.nilai * n.bobot / 100), 0);

            await prisma.nilaiCpl.upsert({
                where: {
                    mahasiswaId_cplId_mataKuliahId_semester_tahunAjaran: {
                        mahasiswaId,
                        cplId,
                        mataKuliahId,
                        semester,
                        tahunAjaran
                    }
                },
                update: {
                    nilai: totalWeighted,
                    updatedAt: new Date()
                },
                create: {
                    mahasiswaId,
                    cplId,
                    mataKuliahId,
                    nilai: totalWeighted,
                    semester,
                    tahunAjaran
                }
            });
        }
    } catch (error) {
        console.error('Calculate nilai CPL from CPMK error:', error);
        // Don't throw, just log
    }
}
