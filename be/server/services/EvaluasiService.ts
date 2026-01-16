
import { prisma } from '../lib/prisma.js';
import { gradingSchemas } from '../schemas/grading.schema.js';

export class EvaluasiService {
    static async getEvaluasiByMataKuliah(mataKuliahId: string, semester?: number, tahunAjaranId?: string) {
        const where: any = { mataKuliahId };
        if (semester) where.semester = semester;
        if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;

        return prisma.evaluasiMataKuliah.findMany({
            where,
            include: {
                dosen: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { namaLengkap: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async submitEvaluasi(userId: string, data: any) {
        const validated = gradingSchemas.evaluasi.parse(data);
        const { mataKuliahId, semester, tahunAjaranId, kendala, rencanaPerbaikan } = validated;

        // Manual upsert to avoid unique key naming issues
        const existing = await prisma.evaluasiMataKuliah.findFirst({
            where: {
                mataKuliahId,
                dosenId: userId,
                semester,
                tahunAjaranId
            }
        });

        if (existing) {
            return prisma.evaluasiMataKuliah.update({
                where: { id: existing.id },
                data: {
                    kendala,
                    rencanaPerbaikan,
                    updatedAt: new Date()
                }
            });
        }

        return prisma.evaluasiMataKuliah.create({
            data: {
                mataKuliahId,
                dosenId: userId,
                semester,
                tahunAjaranId,
                kendala,
                rencanaPerbaikan
            }
        });
    }

    static async reviewEvaluasi(id: string, feedbackKaprodi: string) {
        return prisma.evaluasiMataKuliah.update({
            where: { id },
            data: {
                feedbackKaprodi,
                status: 'reviewed',
                updatedAt: new Date()
            }
        });
    }
}
