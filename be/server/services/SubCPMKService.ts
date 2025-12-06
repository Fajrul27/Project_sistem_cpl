
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

    static async createSubCpmk(cpmkId: string, data: { kode: string, deskripsi: string, bobot?: number }) {
        const subCpmk = await prisma.subCpmk.create({
            data: {
                cpmkId,
                kode: data.kode,
                deskripsi: data.deskripsi,
                bobot: data.bobot || 0
            }
        });

        await recalculateCpmkBulk(cpmkId);
        return subCpmk;
    }

    static async updateSubCpmk(id: string, data: { kode: string, deskripsi: string, bobot?: number }) {
        const subCpmk = await prisma.subCpmk.update({
            where: { id },
            data: {
                kode: data.kode,
                deskripsi: data.deskripsi,
                bobot: data.bobot
            }
        });

        await recalculateCpmkBulk(subCpmk.cpmkId);
        return subCpmk;
    }

    static async deleteSubCpmk(id: string) {
        const subCpmk = await prisma.subCpmk.findUnique({ where: { id } });

        if (subCpmk) {
            await prisma.subCpmk.delete({ where: { id } });
            await recalculateCpmkBulk(subCpmk.cpmkId);
        }
    }

    static async createSubCpmkMapping(subCpmkId: string, teknikPenilaianId: string, bobot: number) {
        const mapping = await prisma.asesmenSubCpmk.create({
            data: {
                subCpmkId,
                teknikPenilaianId,
                bobot
            },
            include: { subCpmk: true }
        });

        await recalculateCpmkBulk(mapping.subCpmk.cpmkId);
        return mapping;
    }

    static async deleteSubCpmkMapping(id: string) {
        const mapping = await prisma.asesmenSubCpmk.findUnique({
            where: { id },
            include: { subCpmk: true }
        });

        if (mapping) {
            await prisma.asesmenSubCpmk.delete({ where: { id } });
            await recalculateCpmkBulk(mapping.subCpmk.cpmkId);
        }
    }
}
