
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

    static async createKategoriCpl(nama: string) {
        return prisma.kategoriCpl.create({
            data: { nama }
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
        // Check for connected records
        const mkCount = await prisma.mataKuliah.count({ where: { kurikulumId: id } });
        const angkatanCount = await prisma.angkatan.count({ where: { kurikulumId: id } });
        const cplCount = await prisma.cpl.count({ where: { kurikulumId: id } });
        const profilLulusanCount = await prisma.profilLulusan.count({ where: { kurikulumId: id } });
        
        if (mkCount > 0 || angkatanCount > 0 || cplCount > 0 || profilLulusanCount > 0) {
            const parts = [];
            if (mkCount > 0) parts.push(`${mkCount} Mata Kuliah`);
            if (angkatanCount > 0) parts.push(`${angkatanCount} Angkatan`);
            if (cplCount > 0) parts.push(`${cplCount} CPL`);
            if (profilLulusanCount > 0) parts.push(`${profilLulusanCount} Profil Lulusan`);
            throw new Error(`Data Kurikulum tidak bisa dihapus karena masih terhubung dengan ${parts.join(', ')}.`);
        }

        return prisma.kurikulum.delete({
            where: { id }
        });
    }

    static async getAllTeknikPenilaianRef() {
        return prisma.teknikPenilaianRef.findMany({
            orderBy: { nama: 'asc' }
        });
    }
    static async getAllTahunAjaran(filters: { isActive?: boolean } = {}) {
        const whereClause: any = {};
        if (filters.isActive !== undefined) {
            whereClause.isActive = filters.isActive;
        }

        return prisma.tahunAjaran.findMany({
            where: whereClause,
            orderBy: { nama: 'desc' }
        });
    }
}
