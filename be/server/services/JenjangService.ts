import { prisma } from '../lib/prisma.js';

export class JenjangService {
    static async getAllJenjang() {
        return prisma.jenjang.findMany({
            orderBy: { nama: 'asc' },
            where: { isActive: true }
        });
    }

    static async createJenjang(data: { nama: string; keterangan?: string }) {
        const existing = await prisma.jenjang.findUnique({ where: { nama: data.nama } });
        if (existing) throw new Error('Jenjang sudah ada');

        return prisma.jenjang.create({ data });
    }

    static async updateJenjang(id: string, data: { nama?: string; keterangan?: string; isActive?: boolean }) {
        if (data.nama) {
            const existing = await prisma.jenjang.findFirst({
                where: { nama: data.nama, NOT: { id } }
            });
            if (existing) throw new Error('Jenjang sudah ada');
        }

        return prisma.jenjang.update({
            where: { id },
            data
        });
    }

    static async deleteJenjang(id: string) {
        const jenjang = await prisma.jenjang.findUnique({ where: { id } });
        if (!jenjang) throw new Error("Jenjang tidak ditemukan");

        // Cek apakah nama jenjang ini sedang digunakan oleh Prodi
        const prodiCount = await prisma.prodi.count({
            where: { jenjang: jenjang.nama }
        });

        if (prodiCount > 0) {
            throw new Error(`Tidak dapat menghapus jenjang. Masih ada ${prodiCount} Prodi yang menggunakan jenjang ini.`);
        }

        return prisma.jenjang.delete({ where: { id } });
    }
}
