
import { prisma } from '../lib/prisma.js';
import { otherSchemas } from '../schemas/other.schema.js';

export class NilaiCplService {
    static async getAllNilaiCpl(params: {
        userId: string,
        userRole: string,
        cplId?: string
    }) {
        const { userId, userRole, cplId } = params;
        const where: any = {};

        if (userRole === 'mahasiswa') {
            where.mahasiswaId = userId;
        }
        if (cplId) {
            where.cplId = cplId;
        }

        return prisma.nilaiCpl.findMany({
            where,
            include: {
                cpl: true,
                mataKuliah: true,
                mahasiswa: {
                    include: { user: true }
                },
                creator: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async getNilaiCplByUser(userId: string) {
        return prisma.nilaiCpl.findMany({
            where: { mahasiswaId: userId },
            include: {
                cpl: true,
                mataKuliah: true,
                mahasiswa: true
            },
            orderBy: { semester: 'asc' }
        });
    }

    static async createNilaiCpl(userId: string, data: any) {
        const validated = otherSchemas.nilaiCpl.parse(data);
        const { mahasiswaId, cplId, mataKuliahId, nilai, semester, tahunAjaranId } = validated;

        return prisma.nilaiCpl.create({
            data: {
                mahasiswaId,
                cplId,
                mataKuliahId,
                nilai: nilai,
                semester: semester,
                tahunAjaranId,
                createdBy: userId
            },
            include: {
                cpl: true,
                mataKuliah: true,
                mahasiswa: {
                    include: { user: true }
                },
                creator: true
            }
        });
    }
}
