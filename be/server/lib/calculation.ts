import { prisma } from './prisma.js';

// Helper function: Calculate Nilai CPMK from Teknik Penilaian
// Helper function: Calculate Nilai CPMK (Supports both Simple and Rigorous OBE)
export async function calculateNilaiCpmk(
    mahasiswaId: string,
    cpmkId: string,
    mataKuliahId: string,
    semester: number,
    tahunAjaran: string
) {
    try {
        // 1. Check if CPMK has Sub-CPMKs
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId },
            include: {
                subCpmk: {
                    include: {
                        asesmenMappings: true
                    }
                },
                teknikPenilaian: true // For simple mode fallback
            }
        });

        if (!cpmk) return;

        let totalNilaiCpmk = 0;
        let totalBobotCpmk = 0;
        let hasCalculated = false;

        // MODE A: Rigorous OBE (Has Sub-CPMKs)
        if (cpmk.subCpmk && cpmk.subCpmk.length > 0) {
            console.log(`Calculating CPMK ${cpmk.kodeCpmk} using Rigorous Mode (Sub-CPMKs: ${cpmk.subCpmk.length})`);

            for (const sub of cpmk.subCpmk) {
                let nilaiSub = 0;
                let totalBobotSub = 0;

                // Calculate Nilai Sub-CPMK from Teknik Penilaian
                if (sub.asesmenMappings && sub.asesmenMappings.length > 0) {
                    for (const mapping of sub.asesmenMappings) {
                        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findFirst({
                            where: {
                                mahasiswaId,
                                teknikPenilaianId: mapping.teknikPenilaianId,
                                semester,
                                tahunAjaran
                            }
                        });

                        if (nilaiTeknik) {
                            nilaiSub += Number(nilaiTeknik.nilai) * Number(mapping.bobot);
                            totalBobotSub += Number(mapping.bobot);
                        }
                    }

                    // Normalize Sub-CPMK Score
                    if (totalBobotSub > 0) {
                        nilaiSub = (nilaiSub / totalBobotSub) * 100; // Assuming bobot is percentage-like or relative
                        // If bobot in mapping is percentage (e.g. 50), totalBobotSub might be 100.
                        // If totalBobotSub is 100, then division by 100 is correct? 
                        // Wait, standard formula: Σ(nilai * bobot) / Σ(bobot). 
                        // If bobot is 50, nilai is 80 -> 4000. Total bobot 50. 4000/50 = 80. Correct.
                        nilaiSub = nilaiSub / 100 * totalBobotSub; // Revert previous line logic error
                        nilaiSub = (nilaiSub / totalBobotSub); // This is just weighted average.
                        // Let's stick to: Σ(nilai * bobot) / Σ(bobot)
                        // Implementation above: nilaiSub += nilai * bobot.
                        // So final: nilaiSub = nilaiSub / totalBobotSub.
                    }
                } else {
                    // Fallback if no mappings (should not happen in rigorous mode, but maybe manual entry?)
                    // For now, treat as 0 or skip
                    continue;
                }

                // Save Nilai Sub-CPMK
                if (totalBobotSub > 0) {
                    await prisma.nilaiSubCpmk.upsert({
                        where: {
                            mahasiswaId_subCpmkId_semester_tahunAjaran: {
                                mahasiswaId,
                                subCpmkId: sub.id,
                                semester,
                                tahunAjaran
                            }
                        },
                        update: { nilai: nilaiSub, updatedAt: new Date() },
                        create: {
                            mahasiswaId,
                            subCpmkId: sub.id,
                            mataKuliahId,
                            nilai: nilaiSub,
                            semester,
                            tahunAjaran
                        }
                    });

                    // Add to CPMK Total
                    totalNilaiCpmk += nilaiSub * Number(sub.bobot);
                    totalBobotCpmk += Number(sub.bobot);
                    hasCalculated = true;
                }
            }
        }

        // MODE B: Simple OBE (Direct Teknik -> CPMK)
        else {
            // console.log(`Calculating CPMK ${cpmk.kodeCpmk} using Simple Mode`);
            const teknikList = cpmk.teknikPenilaian;

            for (const teknik of teknikList) {
                const nilai = await prisma.nilaiTeknikPenilaian.findFirst({
                    where: {
                        mahasiswaId,
                        teknikPenilaianId: teknik.id,
                        semester,
                        tahunAjaran
                    }
                });

                if (nilai) {
                    totalNilaiCpmk += Number(nilai.nilai) * Number(teknik.bobotPersentase);
                    totalBobotCpmk += Number(teknik.bobotPersentase);
                    hasCalculated = true;
                }
            }
        }

        // Finalize CPMK Value
        if (!hasCalculated && totalBobotCpmk === 0) {
            // No data found
            return;
        }

        const nilaiAkhir = totalBobotCpmk > 0 ? (totalNilaiCpmk / totalBobotCpmk) : 0;
        // Note: If bobot is percentage (sum=100), division by 100 is implied if totalBobotCpmk is 100.
        // The formula is generic weighted average.

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
                nilaiAkhir,
                calculatedAt: new Date(),
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                cpmkId,
                mataKuliahId,
                nilaiAkhir,
                semester,
                tahunAjaran
            }
        });

        // Trigger calculation of CPL nilai
        await calculateNilaiCplFromCpmk(mahasiswaId, mataKuliahId, semester, tahunAjaran);

    } catch (error) {
        console.error('Calculate nilai CPMK error:', error);
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
            // Calculate Total Bobot for normalization
            const totalBobot = nilaiArray.reduce((sum, n) => sum + n.bobot, 0);

            // Calculate Weighted Average: Σ(nilai CPMK × bobot) / Σ(bobot)
            // If totalBobot is 0, avoid division by zero
            const totalWeighted = totalBobot > 0
                ? nilaiArray.reduce((sum, n) => sum + (n.nilai * n.bobot), 0) / totalBobot
                : 0;

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
                tahunAjaran: true,
                mataKuliahId: true
            },
            distinct: ['mahasiswaId', 'semester', 'tahunAjaran']
        });

        console.log(`Triggering bulk recalculation for CPMK ${cpmk.kodeCpmk}. Affected students: ${grades.length}`);

        // 3. Trigger calculation for each
        for (const g of grades) {
            await calculateNilaiCpmk(g.mahasiswaId, cpmkId, g.mataKuliahId, g.semester, g.tahunAjaran);
        }

    } catch (error) {
        console.error('Bulk recalculate CPMK error:', error);
    }
}
