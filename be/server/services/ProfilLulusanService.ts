
import { prisma } from '../lib/prisma.js';
import { otherSchemas } from '../schemas/other.schema.js';

export class ProfilLulusanService {
    static async getProfilLulusan(params: { prodiId?: string; page?: number; limit?: number; q?: string }) {
        const { prodiId, page = 1, limit = 10, q } = params;
        const whereClause: any = { isActive: true };

        if (prodiId) {
            whereClause.prodiId = prodiId;
        }

        if (q) {
            whereClause.OR = [
                { kode: { contains: q } },
                { nama: { contains: q } },
                { deskripsi: { contains: q } }
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.profilLulusan.findMany({
                where: whereClause,
                orderBy: { kode: 'asc' },
                include: {
                    prodi: { select: { nama: true } },
                    cplMappings: { include: { cpl: true } }
                },
                skip: limit > 0 ? skip : undefined,
                take: limit > 0 ? limit : undefined,
            }),
            prisma.profilLulusan.count({ where: whereClause })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: limit > 0 ? Math.ceil(total / limit) : 1
            }
        };
    }

    static async createProfilLulusan(data: any) {
        const validated = otherSchemas.profilLulusan.parse(data);

        // Check duplicate
        const existing = await prisma.profilLulusan.findFirst({
            where: {
                prodiId: validated.prodiId,
                kode: validated.kode
            }
        });
        if (existing) throw new Error('DUPLICATE_KODE');

        return prisma.$transaction(async (tx) => {
            const profil = await tx.profilLulusan.create({
                data: {
                    kode: validated.kode,
                    nama: validated.nama,
                    deskripsi: validated.deskripsi,
                    prodiId: validated.prodiId,
                    isActive: validated.isActive ?? true
                }
            });

            if (validated.cplIds && validated.cplIds.length > 0) {
                await tx.profilLulusanCpl.createMany({
                    data: validated.cplIds.map((cplId) => ({
                        profilLulusanId: profil.id,
                        cplId
                    }))
                });
            }

            return profil;
        });
    }

    static async updateProfilLulusan(id: string, data: any) {
        const validated = otherSchemas.profilLulusan.partial().parse(data);

        if (validated.kode && validated.prodiId) {
            const existing = await prisma.profilLulusan.findFirst({
                where: {
                    prodiId: validated.prodiId,
                    kode: validated.kode,
                    NOT: { id }
                }
            });
            if (existing) throw new Error('DUPLICATE_KODE');
        }

        return prisma.$transaction(async (tx) => {
            const profil = await tx.profilLulusan.update({
                where: { id },
                data: {
                    kode: validated.kode,
                    nama: validated.nama,
                    deskripsi: validated.deskripsi,
                    prodiId: validated.prodiId,
                    isActive: validated.isActive
                }
            });

            if (validated.cplIds !== undefined) {
                await tx.profilLulusanCpl.deleteMany({
                    where: { profilLulusanId: id }
                });

                if (validated.cplIds.length > 0) {
                    await tx.profilLulusanCpl.createMany({
                        data: validated.cplIds.map((cplId) => ({
                            profilLulusanId: id,
                            cplId
                        }))
                    });
                }
            }

            return profil;
        });
    }

    static async deleteProfilLulusan(id: string) {
        return prisma.profilLulusan.delete({ where: { id } });
    }
}
