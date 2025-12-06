
import { prisma } from '../lib/prisma.js';
import { calculateNilaiCplFromCpmk } from '../lib/calculation.js';

export class CPMKMappingService {
    static async getAllMappings() {
        return prisma.cpmkCplMapping.findMany({
            include: {
                cpmk: {
                    select: {
                        id: true,
                        kodeCpmk: true,
                        deskripsi: true,
                        mataKuliah: {
                            select: {
                                kodeMk: true,
                                namaMk: true
                            }
                        }
                    }
                },
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true,
                        kategori: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getMappingsByCpmk(cpmkId: string) {
        const mappings = await prisma.cpmkCplMapping.findMany({
            where: { cpmkId },
            include: {
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true,
                        kategori: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        const totalBobot = mappings.reduce((sum, mapping) =>
            sum + Number(mapping.bobotPersentase), 0
        );

        return { mappings, totalBobot: totalBobot.toFixed(2) };
    }

    static async createMapping(userId: string, userRole: string, data: any) {
        const { cpmkId, cplId, bobotPersentase } = data;

        if (!cpmkId || !cplId || bobotPersentase === undefined) {
            throw new Error('MISSING_FIELDS');
        }

        const bobot = parseFloat(bobotPersentase);
        if (bobot < 0 || bobot > 100) {
            throw new Error('INVALID_BOBOT');
        }

        // Check CPMK and Access Control
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId },
            include: { mataKuliah: true }
        });
        if (!cpmk) throw new Error('CPMK_NOT_FOUND');

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (!profile || !profile.prodiId || profile.prodiId !== cpmk.mataKuliah.prodiId) {
                // Legacy check
                if (!profile?.programStudi || profile.programStudi !== cpmk.mataKuliah.programStudi) {
                    throw new Error('FORBIDDEN_ACCESS');
                }
            }
        } else if (userRole === 'dosen') {
            if (cpmk.createdBy !== userId) {
                const pengampu = await prisma.mataKuliahPengampu.findFirst({
                    where: {
                        mataKuliahId: cpmk.mataKuliahId,
                        dosenId: userId
                    }
                });
                if (!pengampu) throw new Error('FORBIDDEN_ACCESS');
            }
        }

        // Check CPL
        const cpl = await prisma.cpl.findUnique({ where: { id: cplId } });
        if (!cpl) throw new Error('CPL_NOT_FOUND');

        const existing = await prisma.cpmkCplMapping.findFirst({ where: { cpmkId, cplId } });
        if (existing) throw new Error('MAPPING_EXISTS');

        // Check Total Bobot
        const currentMappings = await prisma.cpmkCplMapping.findMany({ where: { cpmkId } });
        const currentTotal = currentMappings.reduce((sum, m) => sum + Number(m.bobotPersentase), 0);

        if (currentTotal + bobot > 100) {
            throw new Error(`TOTAL_BOBOT_EXCEEDED:${currentTotal.toFixed(2)}`);
        }

        return prisma.cpmkCplMapping.create({
            data: {
                cpmkId,
                cplId,
                bobotPersentase: bobot
            },
            include: {
                cpmk: { select: { id: true, kodeCpmk: true, deskripsi: true } },
                cpl: { select: { id: true, kodeCpl: true, deskripsi: true } }
            }
        });
    }

    static async updateMapping(id: string, bobotPersentase: any) {
        if (bobotPersentase === undefined) throw new Error('MISSING_FIELDS');

        const bobot = parseFloat(bobotPersentase);
        if (bobot < 0 || bobot > 100) throw new Error('INVALID_BOBOT');

        const existing = await prisma.cpmkCplMapping.findUnique({
            where: { id },
            include: { cpmk: true }
        });
        if (!existing) throw new Error('MAPPING_NOT_FOUND');

        const otherMappings = await prisma.cpmkCplMapping.findMany({
            where: {
                cpmkId: existing.cpmkId,
                id: { not: id }
            }
        });
        const otherTotal = otherMappings.reduce((sum, m) => sum + Number(m.bobotPersentase), 0);

        if (otherTotal + bobot > 100) {
            throw new Error(`TOTAL_BOBOT_EXCEEDED:${otherTotal.toFixed(2)}`);
        }

        const mapping = await prisma.cpmkCplMapping.update({
            where: { id },
            data: { bobotPersentase: bobot },
            include: {
                cpmk: { select: { id: true, kodeCpmk: true, deskripsi: true } },
                cpl: { select: { id: true, kodeCpl: true, deskripsi: true } }
            }
        });

        await this.recalculateCplForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);
        return mapping;
    }

    static async batchCreateMappings(mappings: any[]) {
        const bobotByCpmk = new Map<string, number>();

        for (const m of mappings) {
            const current = bobotByCpmk.get(m.cpmkId) || 0;
            bobotByCpmk.set(m.cpmkId, current + parseFloat(m.bobotPersentase));
        }

        for (const [cpmkId, total] of bobotByCpmk.entries()) {
            if (total > 100) throw new Error(`TOTAL_BOBOT_EXCEEDED_FOR_CPMK:${cpmkId}`);
        }

        return prisma.cpmkCplMapping.createMany({
            data: mappings.map((m: any) => ({
                cpmkId: m.cpmkId,
                cplId: m.cplId,
                bobotPersentase: parseFloat(m.bobotPersentase)
            })),
            skipDuplicates: true
        });
    }

    static async deleteMapping(id: string) {
        const existing = await prisma.cpmkCplMapping.findUnique({
            where: { id },
            include: { cpmk: true }
        });

        if (!existing) throw new Error('MAPPING_NOT_FOUND');

        await prisma.cpmkCplMapping.delete({ where: { id } });
        await this.recalculateCplForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);
    }

    private static async recalculateCplForBatch(cpmkId: string, mataKuliahId: string) {
        try {
            const affectedGrades = await prisma.nilaiCpmk.findMany({
                where: { cpmkId },
                select: { mahasiswaId: true, semester: true, tahunAjaran: true },
                distinct: ['mahasiswaId', 'semester', 'tahunAjaran']
            });

            for (const grade of affectedGrades) {
                await calculateNilaiCplFromCpmk(
                    grade.mahasiswaId,
                    mataKuliahId,
                    grade.semester,
                    grade.tahunAjaran
                );
            }
        } catch (error) {
            console.error('Recalculate CPL batch error:', error);
        }
    }
}
