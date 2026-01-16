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
        // Since we are not strictly enforcing FK on Prodi yet (string column), we might not block this.
        // But ideally we should check if any Prodi uses this string?
        // For now, let's just delete. The prodi logic is weak string matching anyway.
        return prisma.jenjang.delete({ where: { id } });
    }
}
