import { prisma } from '../lib/prisma.js';
import { canAccessMataKuliah, canAccessCpmk, getAccessibleMataKuliahIds } from '../lib/access-control.js';
import { academicSchemas } from '../schemas/academic.schema.js';

interface GetCpmkParams {
    userId: string;
    userRole: string;
    mataKuliahId?: string;
    prodiId?: string;
    fakultasId?: string;
    semester?: string;
    statusValidasi?: string;
    page?: number;
    limit?: number;
    q?: string;
}

export class CPMKService {
    static async getAllCpmk(params: GetCpmkParams) {
        const { userId, userRole, mataKuliahId, prodiId, fakultasId, semester, statusValidasi, page = 1, limit = 10, q } = params;
        const where: any = { isActive: true };

        if (statusValidasi && statusValidasi !== 'all') {
            where.statusValidasi = statusValidasi;
        }

        if (q) {
            where.OR = [
                { kodeCpmk: { contains: q } },
                { deskripsi: { contains: q } },
                { mataKuliah: { namaMk: { contains: q } } },
                { mataKuliah: { kodeMk: { contains: q } } }
            ];
        }

        if (mataKuliahId && mataKuliahId !== 'all') {
            const hasAccess = await canAccessMataKuliah(userId, userRole, mataKuliahId);
            if (!hasAccess) throw new Error('FORBIDDEN_MK');
            // If search (OR) exists, we must wrap AND conditions carefully or merge them.
            // But here mataKuliahId is a specific filter.
            // If we have OR for search, AND we have mataKuliahId, Prisma handles implicit AND if fields differ.
            // But q searches mataKuliah too.
            // To be safe with top-level OR, we should wrap q in AND or use precedence.
            // Actually, implicit top level keys are ANDed.
            where.mataKuliahId = mataKuliahId;
        } else {
            const accessibleMkIds = await getAccessibleMataKuliahIds(userId, userRole);
            if (userRole !== 'admin') {
                // Check if mataKuliahId constraint already set by search? No, search uses relation filter.
                // We need to enforce access control.
                where.mataKuliahId = { in: accessibleMkIds };
            }

            if (prodiId && prodiId !== 'all') {
                where.mataKuliah = { ...where.mataKuliah, prodiId };
            }

            if (fakultasId && fakultasId !== 'all') {
                where.mataKuliah = {
                    ...where.mataKuliah,
                    prodi: { fakultasId }
                };
            }
        }

        if (semester && semester !== 'all') {
            where.mataKuliah = {
                ...where.mataKuliah,
                semester: parseInt(semester)
            };
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.cpmk.findMany({
                where,
                include: {
                    mataKuliah: { select: { id: true, kodeMk: true, namaMk: true, semester: true } },
                    cplMappings: { include: { cpl: { select: { id: true, kodeCpl: true, deskripsi: true } } } },
                    teknikPenilaian: true,
                    levelTaksonomiRef: true,
                    creator: { select: { id: true, email: true, profile: { select: { namaLengkap: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                skip: limit > 0 ? skip : undefined,
                take: limit > 0 ? limit : undefined,
            }),
            prisma.cpmk.count({ where })
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

    static async getCpmkByMataKuliah(mkId: string, userId: string, userRole: string) {
        const hasAccess = await canAccessMataKuliah(userId, userRole, mkId);
        if (!hasAccess) throw new Error('FORBIDDEN_MK');

        return prisma.cpmk.findMany({
            where: { mataKuliahId: mkId, isActive: true },
            include: {
                mataKuliah: { select: { id: true, kodeMk: true, namaMk: true } },
                cplMappings: { include: { cpl: { select: { id: true, kodeCpl: true, deskripsi: true } } } },
                teknikPenilaian: true,
                levelTaksonomiRef: true
            },
            orderBy: { kodeCpmk: 'asc' }
        });
    }

    static async getCpmkById(id: string, userId: string, userRole: string) {
        const hasAccess = await canAccessCpmk(userId, userRole, id);
        if (!hasAccess) throw new Error('FORBIDDEN_CPMK');

        const cpmk = await prisma.cpmk.findUnique({
            where: { id },
            include: {
                mataKuliah: { select: { id: true, kodeMk: true, namaMk: true, semester: true, prodiId: true } },
                cplMappings: { include: { cpl: { select: { id: true, kodeCpl: true, deskripsi: true, kategori: true } } } },
                teknikPenilaian: { orderBy: { createdAt: 'asc' } },
                levelTaksonomiRef: true,
                creator: { select: { id: true, email: true, profile: { select: { namaLengkap: true } } } }
            }
        });

        if (!cpmk) throw new Error('CPMK tidak ditemukan');
        return cpmk;
    }

    static async createCpmk(data: any, userId: string, userRole: string) {
        const validated = academicSchemas.cpmk.parse(data);
        const { kodeCpmk, deskripsi, mataKuliahId, levelTaksonomi, levelTaksonomiId } = validated;

        const hasAccess = await canAccessMataKuliah(userId, userRole, mataKuliahId);
        if (!hasAccess) throw new Error('FORBIDDEN_CREATE_CPMK');

        return prisma.cpmk.create({
            data: {
                kodeCpmk: kodeCpmk.trim(),
                deskripsi: deskripsi?.trim() || null,
                levelTaksonomi: levelTaksonomi?.trim() || null,
                levelTaksonomiId: levelTaksonomiId || null,
                mataKuliahId,
                createdBy: userId
            },
            include: {
                mataKuliah: { select: { id: true, kodeMk: true, namaMk: true } }
            }
        });
    }

    static async updateCpmk(id: string, data: any, userId: string, userRole: string) {
        const validated = academicSchemas.cpmk.partial().parse(data);
        const { kodeCpmk, deskripsi, levelTaksonomi, levelTaksonomiId } = validated;

        const hasAccess = await canAccessCpmk(userId, userRole, id);
        if (!hasAccess) throw new Error('FORBIDDEN_EDIT_CPMK');

        const existing = await prisma.cpmk.findUnique({ where: { id } });
        if (!existing) throw new Error('CPMK tidak ditemukan');

        // Validation: Used in grades?
        if (existing.statusValidasi === 'active') {
            const existingGrades = await prisma.nilaiTeknikPenilaian.count({
                where: { teknikPenilaian: { cpmkId: id } }
            });

            if (existingGrades > 0) {
                throw new Error(`USED_IN_GRADES:${existingGrades}`);
            }
        }

        return prisma.cpmk.update({
            where: { id },
            data: {
                kodeCpmk: kodeCpmk?.trim() || existing.kodeCpmk,
                deskripsi: deskripsi?.trim() || existing.deskripsi,
                levelTaksonomi: levelTaksonomi?.trim() || existing.levelTaksonomi,
                levelTaksonomiId: levelTaksonomiId || existing.levelTaksonomiId
            },
            include: {
                mataKuliah: { select: { id: true, kodeMk: true, namaMk: true } }
            }
        });
    }

    static async deleteCpmk(id: string, userId: string, userRole: string) {
        const hasAccess = await canAccessCpmk(userId, userRole, id);
        if (!hasAccess) throw new Error('FORBIDDEN_DELETE_CPMK');

        const existing = await prisma.cpmk.findUnique({ where: { id } });
        if (!existing) throw new Error('CPMK tidak ditemukan');

        // Validation: Used in grades?
        const existingGrades = await prisma.nilaiTeknikPenilaian.count({
            where: { teknikPenilaian: { cpmkId: id } }
        });

        if (existingGrades > 0) {
            throw new Error(`USED_IN_GRADES:${existingGrades}`);
        }

        return prisma.cpmk.update({
            where: { id },
            data: { isActive: false }
        });
    }

    static async validateCpmk(id: string, statusValidasi: string, userId: string) {
        const validStatuses = ['draft', 'validated', 'active'];
        if (!validStatuses.includes(statusValidasi)) throw new Error('INVALID_STATUS');

        const existing = await prisma.cpmk.findUnique({ where: { id } });
        if (!existing) throw new Error('CPMK tidak ditemukan');

        return prisma.cpmk.update({
            where: { id },
            data: {
                statusValidasi,
                validatedAt: statusValidasi === 'validated' || statusValidasi === 'active' ? new Date() : null,
                validatedBy: statusValidasi === 'validated' || statusValidasi === 'active' ? userId : null
            },
            include: {
                mataKuliah: { select: { id: true, kodeMk: true, namaMk: true } },
                cplMappings: { include: { cpl: true } },
                teknikPenilaian: true
            }
        });
    }
}
