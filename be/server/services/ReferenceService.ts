
import { prisma } from '../lib/prisma.js';

export class ReferenceService {
    static async getAllSemesters() {
        return prisma.semester.findMany({
            where: { isActive: true },
            orderBy: { angka: 'asc' }
        });
    }

    static async getAllKelas() {
        return prisma.kelas.findMany({
            orderBy: { nama: 'asc' }
        });
    }

    static async getAllFakultas() {
        return prisma.fakultas.findMany({
            orderBy: { nama: 'asc' },
            include: { prodi: true }
        });
    }

    static async getAllJenisMataKuliah() {
        return prisma.jenisMataKuliah.findMany({
            orderBy: { nama: 'asc' }
        });
    }

    static async getAllKategoriCpl() {
        return prisma.kategoriCpl.findMany({
            orderBy: { nama: 'asc' }
        });
    }

    static async getAllLevelTaksonomi() {
        return prisma.levelTaksonomi.findMany({
            orderBy: { kode: 'asc' }
        });
    }

    static async getAllKurikulum(filters: { isActive?: boolean } = {}) {
        const whereClause: any = {};
        if (filters.isActive !== undefined) {
            whereClause.isActive = filters.isActive;
        }

        return prisma.kurikulum.findMany({
            where: whereClause,
            orderBy: { tahunMulai: 'desc' }
        });
    }

    static async createKurikulum(data: { nama: string, tahunMulai: number, tahunSelesai?: number, isActive: boolean }) {
        return prisma.kurikulum.create({
            data
        });
    }

    static async updateKurikulum(id: string, data: { nama: string, tahunMulai: number, tahunSelesai?: number, isActive: boolean }) {
        return prisma.kurikulum.update({
            where: { id },
            data
        });
    }

    static async deleteKurikulum(id: string) {
        return prisma.kurikulum.delete({
            where: { id }
        });
    }

    static async getAllTeknikPenilaianRef() {
        return prisma.teknikPenilaianRef.findMany({
            orderBy: { nama: 'asc' }
        });
    }
}
