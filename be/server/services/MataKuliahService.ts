import { prisma } from '../lib/prisma.js';
import { getAccessibleMataKuliahIds } from '../lib/access-control.js';
import { academicSchemas } from '../schemas/academic.schema.js';

interface GetMataKuliahParams {
    userId: string;
    userRole: string;
    semester?: string;
    fakultasId?: string;
    prodiId?: string;
    page?: number;
    limit?: number;
    q?: string;
}

export class MataKuliahService {
    static async getAllMataKuliah(params: GetMataKuliahParams) {
        const { userId, userRole, semester, fakultasId, prodiId, page = 1, limit = 10, q } = params;
        const where: any = { isActive: true };

        if (semester) where.semester = parseInt(semester);

        if (q) {
            where.OR = [
                { kodeMk: { contains: q } }, // Case insensitive by default in MySQL for standard collation, but explicit mode can be added if needed
                { namaMk: { contains: q } }
            ];
        }

        if (prodiId) {
            where.prodiId = prodiId;
        } else if (fakultasId) {
            const prodis = await prisma.prodi.findMany({
                where: { fakultasId },
                select: { id: true }
            });
            where.prodiId = { in: prodis.map(p => p.id) };
        }

        if (userRole === 'dosen') {
            const accessibleIds = await getAccessibleMataKuliahIds(userId, userRole);
            where.id = { in: accessibleIds };
        } else if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (profile?.prodiId) {
                where.prodiId = profile.prodiId;
            } else if (profile?.programStudi) {
                where.programStudi = profile.programStudi;
            }
        } else if (userRole === 'mahasiswa') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (profile?.kelasId) {
                const enrolled = await prisma.mataKuliahPengampu.findMany({
                    where: { kelasId: profile.kelasId },
                    select: { mataKuliahId: true },
                    distinct: ['mataKuliahId']
                });
                const ids = enrolled.map(e => e.mataKuliahId);
                if (ids.length > 0) {
                    where.id = { in: ids };
                } else {
                    // No courses found for this class
                    where.id = { in: [] }; // Prisma handles empty in array as "match nothing" usually, or strictly false
                    // Actually Prisma `in: []` returns nothing, which is correct.
                }
            } else {
                // No class assigned, so no courses followed
                where.id = { in: [] };

                // Optional: Fallback to show courses they have GRADES in (History)?
                // For now, adhere to "di ikuti" (active following via Class). 
                // If the user wants history, they check Transkrip.
            }
        }

        // Handle pagination
        const take = limit === -1 ? undefined : limit;
        const skip = limit === -1 ? undefined : (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.mataKuliah.findMany({
                where,
                orderBy: { kodeMk: 'asc' },
                skip,
                take,
                include: {
                    pengampu: {
                        include: {
                            dosen: {
                                include: {
                                    user: { select: { email: true } }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.mataKuliah.count({ where })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: limit === -1 ? 1 : Math.ceil(total / limit)
            }
        };
    }

    static async getMataKuliahSemesters(userId: string, userRole: string) {
        const where: any = { isActive: true };

        if (userRole === 'dosen') {
            const accessibleIds = await getAccessibleMataKuliahIds(userId, userRole);
            where.id = { in: accessibleIds };
        } else if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (profile?.prodiId) {
                where.prodiId = profile.prodiId;
            } else if (profile?.programStudi) {
                where.programStudi = profile.programStudi;
            }
        }

        const mataKuliahs = await prisma.mataKuliah.findMany({
            where,
            select: { semester: true },
            distinct: ['semester'],
            orderBy: { semester: 'asc' }
        });

        return mataKuliahs.map(mk => mk.semester);
    }

    static async getMataKuliahById(id: string) {
        if (id === 'semesters') return null; // Edge case handling

        const mataKuliah = await prisma.mataKuliah.findUnique({ where: { id } });
        if (!mataKuliah) throw new Error('Mata Kuliah tidak ditemukan');
        return mataKuliah;
    }

    static async getMataKuliahKelas(id: string, userId: string, userRole: string) {
        const where: any = { mataKuliahId: id };

        if (userRole === 'dosen') {
            where.dosenId = userId;
        }

        const pengampu = await prisma.mataKuliahPengampu.findMany({
            where,
            include: { kelas: true },
            distinct: ['kelasId']
        });

        return pengampu
            .map(p => p.kelas)
            .filter(k => k !== null)
            .sort((a, b) => a!.nama.localeCompare(b!.nama));
    }

    static async createMataKuliah(data: any, userId: string, userRole: string) {
        const validated = academicSchemas.mataKuliah.parse(data);
        const { kodeMk, namaMk, sks, semester, semesterId, programStudi, prodiId, kurikulumId, jenisMkId } = validated;

        // Logic for Prodi/Kaprodi handling remains...
        let prodiToUse: string | null | undefined = programStudi;
        let finalProdiId = prodiId;

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (!profile?.prodiId && !profile?.programStudi) {
                throw new Error('Profil Kaprodi tidak memiliki Program Studi');
            }
            if (profile.prodiId) {
                finalProdiId = profile.prodiId;
                prodiToUse = null;
            } else {
                prodiToUse = profile.programStudi;
            }
        }

        return prisma.mataKuliah.create({
            data: {
                kodeMk,
                namaMk,
                sks,
                semester,
                semesterId,
                programStudi: prodiToUse,
                prodiId: finalProdiId,
                kurikulumId,
                jenisMkId,
                createdBy: userId,
            },
        });
    }

    static async updateMataKuliah(id: string, data: any, userId: string, userRole: string) {
        const validated = academicSchemas.mataKuliah.parse(data);
        const { kodeMk, namaMk, sks, semester, semesterId, programStudi, prodiId, kurikulumId, jenisMkId } = validated;

        const existing = await prisma.mataKuliah.findUnique({ where: { id } });
        if (!existing) throw new Error('Mata Kuliah tidak ditemukan');

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (existing.prodiId && profile?.prodiId) {
                if (existing.prodiId !== profile.prodiId) {
                    throw new Error('FORBIDDEN');
                }
            } else if (existing.programStudi !== profile?.programStudi) {
                throw new Error('FORBIDDEN');
            }
        }

        return prisma.mataKuliah.update({
            where: { id },
            data: {
                kodeMk,
                namaMk,
                sks,
                semester,
                semesterId,
                programStudi: userRole === 'admin' ? programStudi : existing.programStudi,
                prodiId: userRole === 'admin' ? prodiId : existing.prodiId,
                kurikulumId,
                jenisMkId
            },
        });
    }

    static async deleteMataKuliah(id: string, userId: string, userRole: string) {
        const existing = await prisma.mataKuliah.findUnique({ where: { id } });
        if (!existing) throw new Error('Mata Kuliah tidak ditemukan');

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (existing.programStudi !== profile?.programStudi && existing.prodiId !== profile?.prodiId) {
                throw new Error('FORBIDDEN');
            }
        }

        return prisma.mataKuliah.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
