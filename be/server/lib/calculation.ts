import { prisma } from './prisma.js';

// Helper function: Calculate Nilai CPMK from Teknik Penilaian
// Helper function: Calculate Nilai CPMK (Supports both Simple and Rigorous OBE)
export async function calculateNilaiCpmk(
    mahasiswaId: string,
    cpmkId: string,
    mataKuliahId: string,
    semester: number,
    tahunAjaranId: string
) {
    try {
        // GRANULAR OBE LOGIC:
        // 1. Calculate Sub-CPMK values from Assessment (Teknik Penilaian)
        // 2. Calculate CPMK value from Sub-CPMKs

        // Step 1: Get all Sub-CPMKs for this CPMK
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId },
            include: {
                subCpmk: {
                    include: {
                        asesmenMappings: {
                            include: { teknikPenilaian: true }
                        }
                    }
                },
                // Fallback: If no Sub-CPMK, check direct Assessment Mapping (if any, typically via Sub-CPMK)
                teknikPenilaian: true
            }
        });

        if (!cpmk) return;

        let nilaiAkhirCpmk = 0;

        // PATH A: Has Sub-CPMKs (Ideal OBE)
        if (cpmk.subCpmk && cpmk.subCpmk.length > 0) {
            let totalBobotSubCpmk = 0;
            let totalScoreSubCpmk = 0;

            for (const sub of cpmk.subCpmk) {
                // Calculate Score for this Sub-CPMK
                let totalBobotAsesmen = 0;
                let totalScoreAsesmen = 0;

                // Get grades for assessments mapped to this Sub-CPMK
                const asesmenMappings = sub.asesmenMappings;

                if (asesmenMappings.length > 0) {
                    for (const mapping of asesmenMappings) {
                        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findFirst({
                            where: {
                                mahasiswaId,
                                teknikPenilaianId: mapping.teknikPenilaianId,
                                semester,
                                tahunAjaranId
                            }
                        });

                        if (nilaiTeknik) {
                            const bobot = Number(mapping.bobot); // Weight of this assessment in this Sub-CPMK
                            totalScoreAsesmen += Number(nilaiTeknik.nilai) * bobot;
                            totalBobotAsesmen += bobot;
                        }
                    }

                    // Calculate Sub-CPMK Score
                    const nilaiSub = totalBobotAsesmen > 0 ? totalScoreAsesmen / totalBobotAsesmen : 0;

                    // Persist Nilai Sub-CPMK
                    await prisma.nilaiSubCpmk.upsert({
                        where: {
                            mahasiswaId_subCpmkId_semester_tahunAjaranId: {
                                mahasiswaId,
                                subCpmkId: sub.id,
                                semester,
                                tahunAjaranId
                            }
                        },
                        update: { nilai: nilaiSub, updatedAt: new Date() },
                        create: {
                            mahasiswaId,
                            subCpmkId: sub.id,
                            mataKuliahId,
                            nilai: nilaiSub,
                            semester,
                            tahunAjaranId
                        }
                    });

                    // Add to CPMK Calculation
                    const bobotSub = Number(sub.bobot);
                    totalScoreSubCpmk += nilaiSub * bobotSub;
                    totalBobotSubCpmk += bobotSub;
                }
            }

            // Finalize CPMK Value
            if (totalBobotSubCpmk > 0) {
                nilaiAkhirCpmk = totalScoreSubCpmk / totalBobotSubCpmk;
            }

        }
        // PATH B: No Sub-CPMKs, use Direct CPMK -> Teknik Penilaian (Simpler)
        else {
            const allTeknik = await prisma.teknikPenilaian.findMany({
                where: { cpmkId: cpmkId }
            });

            if (allTeknik.length > 0) {
                let totalScore = 0;
                let totalWeight = 0;

                for (const teknik of allTeknik) {
                    const nilai = await prisma.nilaiTeknikPenilaian.findFirst({
                        where: {
                            mahasiswaId,
                            teknikPenilaianId: teknik.id,
                            semester,
                            tahunAjaranId
                        }
                    });

                    if (nilai) {
                        totalScore += Number(nilai.nilai) * Number(teknik.bobotPersentase);
                        totalWeight += Number(teknik.bobotPersentase);
                    }
                }

                if (totalWeight > 0) {
                    nilaiAkhirCpmk = totalScore / totalWeight;
                }
            }
        }

        // 4. Update NilaiCpmk
        await prisma.nilaiCpmk.upsert({
            where: {
                mahasiswaId_cpmkId_semester_tahunAjaranId: {
                    mahasiswaId,
                    cpmkId,
                    semester,
                    tahunAjaranId
                }
            },
            update: {
                nilaiAkhir: nilaiAkhirCpmk,
                calculatedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                cpmkId,
                mataKuliahId,
                nilaiAkhir: nilaiAkhirCpmk,
                semester,
                tahunAjaranId
            }
        });

        // 5. Trigger CPL Calculation
        await calculateNilaiCplFromCpmk(mahasiswaId, mataKuliahId, semester, tahunAjaranId);

    } catch (error) {
        console.error('Calculate nilai CPMK error:', error);
    }
}

// Helper function: Calculate Nilai CPL from CPMK
export async function calculateNilaiCplFromCpmk(
    mahasiswaId: string,
    mataKuliahId: string,
    semester: number,
    tahunAjaranId: string
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
                        tahunAjaranId
                    }
                }
            }
        });


        // Group by CPL
        const cplNilaiMap = new Map<string, Array<{ nilai: number; bobot: number }>>();

        for (const cpmk of cpmkList) {
            const nilaiCpmk = cpmk.nilaiCpmk[0];

            if (!nilaiCpmk) {
                continue; // Skip if no nilai yet
            }

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
            // Calculate Total Bobot for normalization
            const totalBobot = nilaiArray.reduce((sum, n) => sum + n.bobot, 0);

            // Calculate Weighted Average: Σ(nilai CPMK × bobot) / Σ(bobot)
            // If totalBobot is 0, avoid division by zero
            const totalWeighted = totalBobot > 0
                ? nilaiArray.reduce((sum, n) => sum + (n.nilai * n.bobot), 0) / totalBobot
                : 0;


            const result = await prisma.nilaiCpl.upsert({
                where: {
                    mahasiswaId_cplId_mataKuliahId_semester_tahunAjaranId: {
                        mahasiswaId,
                        cplId,
                        mataKuliahId,
                        semester,
                        tahunAjaranId
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
                    tahunAjaranId
                }
            });

            // Verify data was actually saved
            const verify = await prisma.nilaiCpl.findUnique({ where: { id: result.id } });
            if (verify) {
            } else {
                console.error(`[CPL Calc] ✗ ERROR: Record NOT FOUND after save! This should never happen!`);
            }
        }

    } catch (error) {
        console.error('[CPL Calc] ERROR:', error);
        // Don't throw, just log
    }
}

// Helper function: Recalculate CPMK for all students (e.g. after weight change)
export async function recalculateCpmkBulk(cpmkId: string) {
    try {
        // 1. Get CPMK info
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId },
            include: { teknikPenilaian: true }
        });

        if (!cpmk) return;

        // 2. Find all students who have grades for this CPMK's teknik penilaian
        // We need distinct students, semester, and tahunAjaran
        const teknikIds = cpmk.teknikPenilaian.map(t => t.id);

        const grades = await prisma.nilaiTeknikPenilaian.findMany({
            where: {
                teknikPenilaianId: { in: teknikIds }
            },
            select: {
                mahasiswaId: true,
                semester: true,
                tahunAjaranId: true,
                mataKuliahId: true
            },
            distinct: ['mahasiswaId', 'semester', 'tahunAjaranId']
        });


        // 3. Trigger calculation for each
        // 3. Trigger calculation for each in BATCHES
        const BATCH_SIZE = 10;
        for (let i = 0; i < grades.length; i += BATCH_SIZE) {
            const batch = grades.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(g =>
                g.tahunAjaranId ? calculateNilaiCpmk(g.mahasiswaId, cpmkId, g.mataKuliahId, g.semester, g.tahunAjaranId) : Promise.resolve()
            ));
        }

    } catch (error) {
        console.error('Bulk recalculate CPMK error:', error);
    }
}
