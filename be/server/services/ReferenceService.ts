
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

    static async getAllKurikulum() {
        return prisma.kurikulum.findMany({
            orderBy: { tahunMulai: 'desc' }
        });
    }

    static async getAllTeknikPenilaianRef() {
        return prisma.teknikPenilaianRef.findMany({
            orderBy: { nama: 'asc' }
        });
    }
}
