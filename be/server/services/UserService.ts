import { prisma } from '../lib/prisma.js';
import { userSchemas } from '../schemas/user.schema.js';

interface GetUsersParams {
    role?: string;
    page: number;
    limit: number;
    q?: string;
    userId: string;
    userRole: string;
    mataKuliahId?: string;
    kelasId?: string;
    fakultasId?: string;
    // New filters
    semester?: number;
    prodi?: string;
    prodiId?: string;
    kelas?: string;

    sortBy?: string;
    sortOrder?: string;
}

export class UserService {
    static async getAllUsers(params: GetUsersParams) {
        const {
            role, page, limit, q,
            userId, userRole, mataKuliahId,
            kelasId, fakultasId,
            semester, prodi, prodiId, kelas,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = params;

        const skip = (page - 1) * limit;
        let where: any = {};

        // Filter by role
        if (role) {
            where.role = { role: { name: role } };
        }

        // Initialize profile where clause if needed
        const ensureProfileWhere = () => {
            if (!where.profile) where.profile = {};
        };

        // [SECURITY] Kaprodi only sees users in their prodi
        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (profile?.prodiId) {
                ensureProfileWhere();
                where.profile.prodiId = profile.prodiId;
            }
        }

        // [SECURITY] Dosen filters
        if (userRole === 'dosen') {
            const dosenProfile = await prisma.profile.findUnique({ where: { userId } });
            const dosenProdiId = dosenProfile?.prodiId;

            let allowedStudentIds = new Set<string>();

            // 1. Add students from the Dosen's Prodi
            if (dosenProdiId) {
                const prodiStudents = await prisma.profile.findMany({
                    where: {
                        prodiId: dosenProdiId,
                        user: { role: { role: { name: 'mahasiswa' } } }
                    },
                    select: { userId: true }
                });
                prodiStudents.forEach(s => allowedStudentIds.add(s.userId));
            }

            // 2. Add students from courses the Dosen teaches
            if (mataKuliahId) {
                const isPengampu = await prisma.mataKuliahPengampu.findFirst({
                    where: { mataKuliahId, dosenId: userId, isPengampu: true }
                });

                if (!isPengampu) {
                    throw new Error('FORBIDDEN_ACCESS_MK');
                }

                const mataKuliah = await prisma.mataKuliah.findUnique({ where: { id: mataKuliahId } });
                if (!mataKuliah) throw new Error('MK_NOT_FOUND');

                let mahasiswaList: { userId: string }[] = [];
                if (mataKuliah.prodiId) {
                    mahasiswaList = await prisma.profile.findMany({
                        where: {
                            prodiId: mataKuliah.prodiId,
                            semester: mataKuliah.semester,
                            user: { role: { role: { name: 'mahasiswa' } } }
                        },
                        select: { userId: true }
                    });
                } else if (mataKuliah.programStudi) {
                    mahasiswaList = await prisma.profile.findMany({
                        where: {
                            programStudi: mataKuliah.programStudi,
                            semester: mataKuliah.semester,
                            user: { role: { role: { name: 'mahasiswa' } } }
                        },
                        select: { userId: true }
                    });
                }
                mahasiswaList.forEach(m => allowedStudentIds.add(m.userId));

            } else {
                // Get all students related to this dosen (taught courses)
                const mataKuliahPengampuList = await prisma.mataKuliahPengampu.findMany({
                    where: { dosenId: userId, isPengampu: true },
                    include: { mataKuliah: true }
                });

                const criteria: any[] = [];

                mataKuliahPengampuList.forEach(mkPengampu => {
                    const mk = mkPengampu.mataKuliah;
                    if (mkPengampu.kelasId) {
                        criteria.push({
                            kelasId: mkPengampu.kelasId,
                            user: { role: { role: { name: 'mahasiswa' } } }
                        });
                    } else if (mk.prodiId) {
                        criteria.push({
                            prodiId: mk.prodiId,
                            semester: mk.semester,
                            user: { role: { role: { name: 'mahasiswa' } } }
                        });
                    } else if (mk.programStudi) {
                        criteria.push({
                            programStudi: mk.programStudi,
                            semester: mk.semester,
                            user: { role: { role: { name: 'mahasiswa' } } }
                        });
                    }
                });

                if (criteria.length > 0) {
                    const relatedStudents = await prisma.profile.findMany({
                        where: { OR: criteria },
                        select: { userId: true }
                    });
                    relatedStudents.forEach(m => allowedStudentIds.add(m.userId));
                }
            }

            // Apply filter
            if (allowedStudentIds.size > 0) {
                where.id = { in: Array.from(allowedStudentIds) };
            } else {
                // Dosen has no prodi and no courses -> see nothing? 
                // Or fallback to nothing.
                where.id = { in: [] };
            }
        }

        // Search filter
        if (q) {
            where.OR = [
                { email: { contains: q } },
                {
                    profile: {
                        OR: [
                            { namaLengkap: { contains: q } },
                            { nim: { contains: q } }
                        ]
                    }
                }
            ];
        }

        // Additional filters
        if (kelasId) {
            ensureProfileWhere();
            where.profile.kelasId = kelasId;
        }

        if (fakultasId) {
            ensureProfileWhere();
            where.profile.prodi = { fakultasId: fakultasId };
        }

        if (prodiId) {
            ensureProfileWhere();
            where.profile.prodiId = prodiId;
        }

        if (semester) {
            ensureProfileWhere();
            where.profile.semester = semester;
        }

        if (prodi) {
            ensureProfileWhere();
            // Handle both relational and legacy string field
            // Using AND to combine with existing profile filters if any
            where.profile = {
                ...where.profile,
                OR: [
                    { prodi: { nama: prodi } },
                    { programStudi: prodi }
                ]
            };
        }

        if (kelas) {
            ensureProfileWhere();
            // Filter by Class Name (via relation)
            where.profile.kelasRef = { nama: kelas };
        }

        // Count total
        const total = await prisma.user.count({ where });

        // Sorting
        let orderBy: any = {};
        if (sortBy === 'nim') {
            orderBy = { profile: { nim: sortOrder } };
        } else if (sortBy === 'nama') {
            orderBy = { profile: { namaLengkap: sortOrder } };
        } else {
            orderBy = { [sortBy]: sortOrder };
        }

        // Fetch data
        const users = await prisma.user.findMany({
            where,
            include: {
                role: { include: { role: true } },
                profile: {
                    include: {
                        prodi: { include: { fakultas: true } },
                        kelasRef: true,
                        angkatanRef: true,
                        mataKuliahPengampu: {
                            include: {
                                mataKuliah: {
                                    include: {
                                        prodi: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy,
            skip: limit === -1 ? undefined : skip,
            take: limit === -1 ? undefined : limit
        });

        // Enhance users with taught prodi information for lecturers
        const enhancedUsers = users.map(user => {
            const userData = { ...user } as any;

            // For dosen/kaprodi, add info about which prodi they teach
            if (user.role?.role?.name === 'dosen' || user.role?.role?.name === 'kaprodi') {
                const pengampu = user.profile?.mataKuliahPengampu || [];
                const taughtProdis = new Set<string>();

                pengampu.forEach(p => {
                    if (p.mataKuliah?.prodi?.nama) {
                        taughtProdis.add(p.mataKuliah.prodi.nama);
                    }
                });

                userData.taughtProdis = Array.from(taughtProdis);
            }

            return userData;
        });

        return {
            data: enhancedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: limit === -1 ? 1 : Math.ceil(total / limit)
            }
        };
    }

    static async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                profile: true
            }
        });
        if (!user) throw new Error('User tidak ditemukan');
        return user;
    }

    static async updateUserRole(id: string, roleName: string) {
        const allowedRoles = ['admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan'];
        if (!roleName || !allowedRoles.includes(roleName)) {
            throw new Error('Role tidak valid');
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) throw new Error('User tidak ditemukan');

        // Get role ID
        const roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
        if (!roleRecord) throw new Error('Role tidak ditemukan');

        await prisma.userRole.upsert({
            where: { userId: id },
            update: { roleId: roleRecord.id },
            create: { userId: id, roleId: roleRecord.id }
        });

        return prisma.user.findUnique({
            where: { id },
            include: { role: { include: { role: true } }, profile: true }
        });
    }

    static async updateUser(id: string, data: any) {
        // Validation
        const validated = userSchemas.update.parse(data);

        const existingUser = await prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!existingUser) throw new Error('User tidak ditemukan');

        const { email, role, isActive, profile, password } = validated;

        // Get roleId if role name provided
        let roleUpdate;
        if (role) {
            const roleRecord = await prisma.role.findUnique({ where: { name: role } });
            if (!roleRecord) throw new Error('Role tidak ditemukan');
            roleUpdate = {
                upsert: {
                    create: { roleId: roleRecord.id },
                    update: { roleId: roleRecord.id }
                }
            };
        }

        return prisma.user.update({
            where: { id },
            data: {
                email,
                isActive,
                ...(password && { passwordHash: await import('bcryptjs').then(b => b.hash(password, 10)) }), // Optional password update support
                ...(roleUpdate && { role: roleUpdate }),
                ...(profile && {
                    profile: {
                        upsert: {
                            create: profile as any,
                            update: profile
                        }
                    }
                })
            },
            include: { role: true, profile: true }
        });
    }

    static async deleteUser(id: string) {
        return prisma.user.delete({ where: { id } });
    }
}
