import { prisma } from '../lib/prisma.js';

export class AcademicService {
    // Fakultas Operations
    static async getAllFakultas() {
        return prisma.fakultas.findMany({
            orderBy: { kode: 'asc' },
            include: {
                prodi: true
            }
        });
    }

    // Prodi Operations
    static async getAllProdi(fakultasId?: string) {
        const where: any = {};
        if (fakultasId) {
            where.fakultasId = fakultasId;
        }

        return prisma.prodi.findMany({
            where,
            orderBy: { nama: 'asc' },
            include: {
                fakultas: true
            }
        });
    }

    // Angkatan Operations
    static async getAllAngkatan() {
        return prisma.angkatan.findMany({
            orderBy: { tahun: 'desc' },
            where: { isActive: true }
        });
    }

    static async createAngkatan(tahun: number) {
        if (!tahun) throw new Error('Tahun harus diisi');

        return prisma.angkatan.create({
            data: {
                tahun: tahun
            }
        });
    }
}
