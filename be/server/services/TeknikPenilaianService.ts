import { prisma } from '../lib/prisma.js';
import { calculateNilaiCpmk } from '../lib/calculation.js';
import { gradingSchemas } from '../schemas/grading.schema.js';

export class TeknikPenilaianService {
    static async getTeknikByCpmk(cpmkId: string) {
        const teknikPenilaian = await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            orderBy: { createdAt: 'asc' },
            include: {
                teknikRef: true
            }
        });

        const totalBobot = teknikPenilaian.reduce((sum, tp) =>
            sum + Number(tp.bobotPersentase), 0
        );

        return {
            data: teknikPenilaian,
            totalBobot: totalBobot.toFixed(2)
        };
    }

    static async createTeknikPenilaian(data: any) {
        const validated = gradingSchemas.teknikPenilaian.parse(data);
        const { cpmkId, namaTeknik, bobotPersentase, deskripsi, teknikRefId } = validated;

        let finalNamaTeknik = namaTeknik;
        if (teknikRefId) {
            const ref = await prisma.teknikPenilaianRef.findUnique({ where: { id: teknikRefId } });
            if (!ref) throw new Error('REF_NOT_FOUND');
            finalNamaTeknik = ref.nama;
        }

        const bobot = bobotPersentase; // Already coerced and validated by Zod

        const cpmk = await prisma.cpmk.findUnique({ where: { id: cpmkId } });
        if (!cpmk) throw new Error('CPMK_NOT_FOUND');

        // Check total weight
        const currentTeknik = await prisma.teknikPenilaian.findMany({ where: { cpmkId } });
        const currentTotal = currentTeknik.reduce((sum, tp) => sum + Number(tp.bobotPersentase), 0);

        if (currentTotal + bobot > 100) {
            throw new Error(`WEIGHT_OVERFLOW:${currentTotal.toFixed(2)}`);
        }

        return prisma.teknikPenilaian.create({
            data: {
                cpmkId,
                namaTeknik: finalNamaTeknik.trim(),
                teknikRefId: teknikRefId || null,
                bobotPersentase: bobot,
                deskripsi: deskripsi?.trim() || null
            }
        });
    }

    static async updateTeknikPenilaian(id: string, data: any) {
        const validated = gradingSchemas.teknikPenilaian.partial().parse(data);
        const { namaTeknik, bobotPersentase, deskripsi, teknikRefId } = validated;

        const existing = await prisma.teknikPenilaian.findUnique({
            where: { id },
            include: { cpmk: true }
        });
        if (!existing) throw new Error('NOT_FOUND');

        const updateData: any = {};
        if (namaTeknik !== undefined) updateData.namaTeknik = namaTeknik.trim();

        if (teknikRefId !== undefined) {
            updateData.teknikRefId = teknikRefId;
            if (teknikRefId) {
                const ref = await prisma.teknikPenilaianRef.findUnique({ where: { id: teknikRefId } });
                if (ref) updateData.namaTeknik = ref.nama;
            }
        }

        if (deskripsi !== undefined) updateData.deskripsi = deskripsi?.trim() || null;

        let weightChanged = false;
        if (bobotPersentase !== undefined) {
            const bobot = bobotPersentase;

            const otherTeknik = await prisma.teknikPenilaian.findMany({
                where: {
                    cpmkId: existing.cpmkId,
                    id: { not: id }
                }
            });
            const otherTotal = otherTeknik.reduce((sum, tp) => sum + Number(tp.bobotPersentase), 0);

            if (otherTotal + bobot > 100) {
                throw new Error(`WEIGHT_OVERFLOW:${otherTotal.toFixed(2)}`);
            }

            updateData.bobotPersentase = bobot;
            weightChanged = true;
        }

        const result = await prisma.teknikPenilaian.update({
            where: { id },
            data: updateData
        });

        if (weightChanged) {
            await this.recalculateCpmkForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);
        }

        return result;
    }

    static async deleteTeknikPenilaian(id: string) {
        const existing = await prisma.teknikPenilaian.findUnique({
            where: { id },
            include: { cpmk: true }
        });
        if (!existing) throw new Error('NOT_FOUND');

        await prisma.teknikPenilaian.delete({ where: { id } });
        await this.recalculateCpmkForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);
    }

    // Helper: Recalculate CPMK for all affected students
    private static async recalculateCpmkForBatch(cpmkId: string, mataKuliahId: string) {
        try {
            const teknikIds = (await prisma.teknikPenilaian.findMany({
                where: { cpmkId },
                select: { id: true }
            })).map(t => t.id);

            if (teknikIds.length === 0) return;

            const affectedGrades = await prisma.nilaiTeknikPenilaian.findMany({
                where: { teknikPenilaianId: { in: teknikIds } },
                select: {
                    mahasiswaId: true,
                    semester: true,
                    tahunAjaran: true
                },
                distinct: ['mahasiswaId', 'semester', 'tahunAjaran']
            });

            console.log(`Recalculating CPMK ${cpmkId} for ${affectedGrades.length} students`);

            for (const grade of affectedGrades) {
                await calculateNilaiCpmk(
                    grade.mahasiswaId,
                    cpmkId,
                    mataKuliahId,
                    grade.semester,
                    grade.tahunAjaran
                );
            }
        } catch (error) {
            console.error('Recalculate batch error:', error);
        }
    }
}
