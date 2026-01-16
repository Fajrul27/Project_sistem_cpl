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

    static async createFakultas(data: { kode: string; nama: string }) {
        // Validate unique kode
        const existing = await prisma.fakultas.findUnique({ where: { kode: data.kode } });
        if (existing) throw new Error('Kode Fakultas sudah digunakan');

        return prisma.fakultas.create({ data });
    }

    static async updateFakultas(id: string, data: { kode?: string; nama?: string }) {
        if (data.kode) {
            const existing = await prisma.fakultas.findFirst({
                where: { kode: data.kode, NOT: { id } }
            });
            if (existing) throw new Error('Kode Fakultas sudah digunakan');
        }

        return prisma.fakultas.update({
            where: { id },
            data
        });
    }

    static async deleteFakultas(id: string) {
        // Check for existing Prodi
        const count = await prisma.prodi.count({ where: { fakultasId: id } });
        if (count > 0) throw new Error(`Tidak dapat menghapus fakultas. Masih ada ${count} prodi terkait.`);

        return prisma.fakultas.delete({ where: { id } });
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

    static async createProdi(data: { kode: string; nama: string; jenjang: string; fakultasId: string }) {
        // Validate unique kode
        const existingCode = await prisma.prodi.findFirst({ where: { kode: data.kode } });
        if (existingCode) throw new Error('Kode Prodi sudah digunakan');

        const existingName = await prisma.prodi.findUnique({ where: { nama: data.nama } });
        if (existingName) throw new Error('Nama Prodi sudah digunakan');

        return prisma.prodi.create({ data });
    }

    static async updateProdi(id: string, data: { kode?: string; nama?: string; jenjang?: string; fakultasId?: string }) {
        if (data.kode) {
            const existing = await prisma.prodi.findFirst({
                where: { kode: data.kode, NOT: { id } }
            });
            if (existing) throw new Error('Kode Prodi sudah digunakan');
        }

        if (data.nama) {
            const existing = await prisma.prodi.findFirst({
                where: { nama: data.nama, NOT: { id } }
            });
            if (existing) throw new Error('Nama Prodi sudah digunakan');
        }

        return prisma.prodi.update({
            where: { id },
            data
        });
    }

    static async deleteProdi(id: string) {
        // Check for related data (e.g. Mahasiswa, MataKuliah)

        const mahasiswaCount = await prisma.profile.count({ where: { prodiId: id } });
        if (mahasiswaCount > 0) throw new Error(`Gagal hapus: Terdapat ${mahasiswaCount} mahasiswa (profile) di prodi ini`);

        const mkCount = await prisma.mataKuliah.count({ where: { prodiId: id } });
        if (mkCount > 0) throw new Error(`Gagal hapus: Terdapat ${mkCount} mata kuliah di prodi ini`);

        return prisma.prodi.delete({ where: { id } });
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
