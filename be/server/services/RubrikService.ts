import { prisma } from '../lib/prisma.js';
import { gradingSchemas } from '../schemas/grading.schema.js';

export class RubrikService {
    static async getRubrikByCpmk(cpmkId: string) {
        return prisma.rubrik.findUnique({
            where: { cpmkId },
            include: {
                kriteria: {
                    include: {
                        levels: {
                            orderBy: { nilai: 'desc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    static async createOrUpdateRubrik(cpmkId: string, deskripsi: string, kriteria: any[]) {
        // Validate whole payload (constructing object to match schema)
        const validated = gradingSchemas.rubrik.parse({ cpmkId, deskripsi, kriteria });
        const { kriteria: validatedKriteria } = validated;

        if (!validatedKriteria || validatedKriteria.length === 0) {
            throw new Error('INVALID_DATA');
        }

        const cpmk = await prisma.cpmk.findUnique({ where: { id: cpmkId } });
        if (!cpmk) throw new Error('CPMK_NOT_FOUND');

        // Transaction to handle full replacement of rubric structure
        return prisma.$transaction(async (tx) => {
            const existingRubrik = await tx.rubrik.findUnique({ where: { cpmkId } });
            let rubrikId = existingRubrik?.id;

            if (existingRubrik) {
                await tx.rubrik.update({
                    where: { id: rubrikId },
                    data: { deskripsi: deskripsi || null }
                });
                await tx.rubrikKriteria.deleteMany({ where: { rubrikId } });
            } else {
                const newRubrik = await tx.rubrik.create({
                    data: { cpmkId, deskripsi: deskripsi || null }
                });
                rubrikId = newRubrik.id;
            }

            for (const krit of validatedKriteria) {
                const newKriteria = await tx.rubrikKriteria.create({
                    data: {
                        rubrikId: rubrikId!,
                        deskripsi: krit.deskripsi,
                        bobot: krit.bobot
                    }
                });

                if (Array.isArray(krit.levels)) {
                    await tx.rubrikLevel.createMany({
                        data: krit.levels.map((lvl: any) => ({
                            kriteriaId: newKriteria.id,
                            deskripsi: lvl.deskripsi,
                            nilai: lvl.nilai,
                            label: lvl.label
                        }))
                    });
                }
            }

            return tx.rubrik.findUnique({
                where: { id: rubrikId },
                include: {
                    kriteria: {
                        include: { levels: true }
                    }
                }
            });
        });
    }

    static async deleteRubrik(id: string) {
        // Validation could be added here if needed (e.g. check if used in grading)
        // But for now, Cascade delete handles cleanup of criteria/levels.
        // What about 'NilaiRubrik'? It has relation to NilaiTeknikPenilaian.
        // It cascades on delete of RubrikLevel. So deleting Rubrik -> deletes Kriteria -> deletes Level -> deletes NilaiRubrik.
        // seems safe.
        await prisma.rubrik.delete({ where: { id } });
    }
}
