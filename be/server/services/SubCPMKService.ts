
import { prisma } from '../lib/prisma.js';
import { recalculateCpmkBulk } from '../lib/calculation.js';

export class SubCPMKService {
    static async getSubCpmk(cpmkId: string) {
        return prisma.subCpmk.findMany({
            where: { cpmkId },
            include: {
                asesmenMappings: {
                    include: {
                        teknikPenilaian: true
                    }
                }
            },
            orderBy: { kode: 'asc' }
        });
    }

    private static async validateTotalBobot(cpmkId: string, newBobot: number, excludeId?: string, existingBobot?: number) {
        const where: any = { cpmkId };
        if (excludeId) {
            where.id = { not: excludeId };
        }

        const aggregate = await prisma.subCpmk.aggregate({
            where,
            _sum: { bobot: true }
        });

        const sumOfOthers = Number(aggregate._sum.bobot || 0);
        if (sumOfOthers + newBobot > 100) {
            // If excludeId is present (update), 'current' total in DB includes existingBobot.
            // If add, current total is just sumOfOthers.
            const displayTotal = excludeId && existingBobot !== undefined ? sumOfOthers + existingBobot : sumOfOthers;
            throw new Error(`TOTAL_WEIGHT_EXCEEDED:${displayTotal}`);
        }
    }

    static async createSubCpmk(cpmkId: string, data: { kode: string, deskripsi: string, bobot?: number }) {
        await this.validateTotalBobot(cpmkId, data.bobot || 0);

        const subCpmk = await prisma.subCpmk.create({
            data: {
                cpmkId,
                kode: data.kode,
                deskripsi: data.deskripsi,
                bobot: data.bobot || 0
            }
        });

        recalculateCpmkBulk(cpmkId).catch(err => console.error('Background recalc error:', err));
        return subCpmk;
    }

    static async updateSubCpmk(id: string, data: { kode: string, deskripsi: string, bobot?: number }) {
        const existing = await prisma.subCpmk.findUnique({ where: { id } });
        if (!existing) throw new Error('Sub-CPMK tidak ditemukan');

        if (data.bobot !== undefined) {
            await this.validateTotalBobot(existing.cpmkId, data.bobot, id, Number(existing.bobot));
        }

        const subCpmk = await prisma.subCpmk.update({
            where: { id },
            data: {
                kode: data.kode,
                deskripsi: data.deskripsi,
                bobot: data.bobot
            }
        });

        recalculateCpmkBulk(subCpmk.cpmkId).catch(err => console.error('Background recalc error:', err));
        return subCpmk;
    }

    static async deleteSubCpmk(id: string) {
        const subCpmk = await prisma.subCpmk.findUnique({ where: { id } });

        if (subCpmk) {
            await prisma.subCpmk.delete({ where: { id } });
            recalculateCpmkBulk(subCpmk.cpmkId).catch(err => console.error('Background recalc error:', err));
        }
    }

    static async createSubCpmkMapping(subCpmkId: string, teknikPenilaianId: string, bobot: number) {
        const mapping = await prisma.asesmenSubCpmk.upsert({
            where: {
                teknikPenilaianId_subCpmkId: {
                    subCpmkId,
                    teknikPenilaianId
                }
            },
            create: {
                subCpmkId,
                teknikPenilaianId,
                bobot
            },
            update: {
                bobot
            },
            include: { subCpmk: true }
        });

        recalculateCpmkBulk(mapping.subCpmk.cpmkId).catch(err => console.error('Background recalc error:', err));
        return mapping;
    }

    static async deleteSubCpmkMapping(id: string) {
        const mapping = await prisma.asesmenSubCpmk.findUnique({
            where: { id },
            include: { subCpmk: true }
        });

        if (mapping) {
            await prisma.asesmenSubCpmk.delete({ where: { id } });
            recalculateCpmkBulk(mapping.subCpmk.cpmkId).catch(err => console.error('Background recalc error:', err));
        }
    }
}
