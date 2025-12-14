
import { prisma } from '../lib/prisma.js';
import { otherSchemas } from '../schemas/other.schema.js';

export class VisiMisiService {
    static async getVisiMisi(prodiId?: string) {
        const whereClause: any = { isActive: true };
        if (prodiId) {
            whereClause.prodiId = prodiId;
        }

        return prisma.visiMisi.findMany({
            where: whereClause,
            orderBy: [
                { tipe: 'desc' },
                { urutan: 'asc' }
            ],
            include: { prodi: { select: { nama: true } } }
        });
    }

    static async createVisiMisi(data: any) {
        const validated = otherSchemas.visiMisi.parse(data);
        return prisma.visiMisi.create({
            data: {
                teks: validated.teks,
                tipe: validated.tipe,
                urutan: validated.urutan,
                prodiId: validated.prodiId,
                isActive: validated.isActive ?? true
            }
        });
    }

    static async updateVisiMisi(id: string, data: any) {
        const validated = otherSchemas.visiMisi.partial().parse(data);
        return prisma.visiMisi.update({
            where: { id },
            data: validated
        });
    }

    static async deleteVisiMisi(id: string) {
        return prisma.visiMisi.delete({ where: { id } });
    }
}
