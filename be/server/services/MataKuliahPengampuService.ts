import { prisma } from '../lib/prisma.js';

export class MataKuliahPengampuService {
    static async getPengampuByMataKuliah(mataKuliahId: string) {
        return prisma.mataKuliahPengampu.findMany({
            where: { mataKuliahId },
            include: {
                dosen: {
                    select: {
                        userId: true,
                        namaLengkap: true,
                        nidn: true,
                        nip: true,
                        user: {
                            select: { email: true }
                        }
                    }
                },
                kelas: true
            }
        });
    }

    static async getAssignmentsByDosen(dosenId: string) {
        return prisma.mataKuliahPengampu.findMany({
            where: { dosenId },
            include: {
                mataKuliah: {
                    include: {
                        prodi: true
                    }
                },
                kelas: true
            }
        });
    }

    static async getAllAssignments(filters?: { prodiId?: string; semester?: number; fakultasId?: string }) {
        const where: any = {};

        if (filters?.semester) {
            where.mataKuliah = { semester: filters.semester };
        }

        if (filters?.prodiId) {
            where.mataKuliah = { ...where.mataKuliah, prodiId: filters.prodiId };
        } else if (filters?.fakultasId) {
            where.mataKuliah = { ...where.mataKuliah, prodi: { fakultasId: filters.fakultasId } };
        }

        return prisma.mataKuliahPengampu.findMany({
            where,
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true,
                        semester: true,
                        sks: true,
                        prodi: { select: { nama: true } }
                    }
                },
                dosen: {
                    select: {
                        id: true,
                        namaLengkap: true,
                        nidn: true,
                        nip: true,
                        user: { select: { email: true } }
                    }
                },
                kelas: {
                    select: { id: true, nama: true }
                }
            },
            orderBy: [
                { mataKuliah: { semester: 'asc' } },
                { mataKuliah: { kodeMk: 'asc' } }
            ]
        });
    }

    static async assignDosen(data: any, userId: string, userRole: string) {
        const { mataKuliahId, dosenId, kelasId, isPengampu } = data;

        if (userRole === 'kaprodi') {
            const mataKuliah = await prisma.mataKuliah.findUnique({
                where: { id: mataKuliahId }
            });
            const profile = await prisma.profile.findUnique({ where: { userId } });

            if (!mataKuliah || mataKuliah.programStudi !== profile?.programStudi) {
                // If using new prodiId structure
                if (mataKuliah?.prodiId && mataKuliah.prodiId !== profile?.prodiId) {
                    throw new Error('FORBIDDEN_ACCESS');
                } else if (!mataKuliah?.prodiId && !mataKuliah?.programStudi) {
                    // Fallback or restrictive default
                } else if (mataKuliah?.programStudi && mataKuliah.programStudi !== profile?.programStudi) {
                    // Check if profile has prodiId
                    if (!profile?.prodiId) throw new Error('FORBIDDEN_ACCESS');
                }
            }
        }

        const existing = await prisma.mataKuliahPengampu.findFirst({
            where: {
                mataKuliahId,
                dosenId,
                kelasId: kelasId || null
            }
        });

        if (existing) throw new Error('ALREADY_EXISTS');

        return prisma.mataKuliahPengampu.create({
            data: {
                mataKuliahId,
                dosenId,
                kelasId,
                isPengampu: isPengampu ?? true
            }
        });
    }

    static async removeAssignment(id: string, userId: string, userRole: string) {
        if (userRole === 'kaprodi') {
            const assignment = await prisma.mataKuliahPengampu.findUnique({
                where: { id },
                include: { mataKuliah: true }
            });
            const profile = await prisma.profile.findUnique({ where: { userId } });

            if (!assignment) throw new Error('NOT_FOUND');

            if (assignment.mataKuliah.prodiId) {
                if (assignment.mataKuliah.prodiId !== profile?.prodiId) throw new Error('FORBIDDEN_ACCESS');
            } else {
                if (assignment.mataKuliah.programStudi !== profile?.programStudi) throw new Error('FORBIDDEN_ACCESS');
            }
        }

        await prisma.mataKuliahPengampu.delete({ where: { id } });
    }

    static async getPesertaByMataKuliah(mataKuliahId: string, userId: string) {
        const pengampuCheck = await prisma.mataKuliahPengampu.findFirst({
            where: {
                mataKuliahId,
                dosenId: userId,
                isPengampu: true
            },
            include: { mataKuliah: true }
        });

        if (!pengampuCheck) throw new Error('FORBIDDEN_ACCESS');

        const mataKuliah = pengampuCheck.mataKuliah;
        let mahasiswaList: any[] = [];
        const commonSelect = {
            userId: true,
            namaLengkap: true,
            nim: true,
            programStudi: true,
            prodiId: true,
            kelasId: true,
            user: { select: { email: true } },
            kelasRef: { select: { nama: true } },
            prodi: { select: { nama: true } }
        };

        if (mataKuliah.prodiId) {
            mahasiswaList = await prisma.profile.findMany({
                where: {
                    prodiId: mataKuliah.prodiId,
                    semester: mataKuliah.semester,
                    user: { role: { role: 'mahasiswa' } }
                },
                select: commonSelect
            });
        } else if (mataKuliah.programStudi) {
            mahasiswaList = await prisma.profile.findMany({
                where: {
                    programStudi: mataKuliah.programStudi,
                    semester: mataKuliah.semester,
                    user: { role: { role: 'mahasiswa' } }
                },
                select: commonSelect
            });
        }

        return mahasiswaList.map(m => ({
            userId: m.userId,
            namaLengkap: m.namaLengkap,
            nim: m.nim,
            email: m.user?.email || 'Tidak ada email',
            kelas: m.kelasRef?.nama || 'Tidak ada kelas',
            programStudi: m.prodi?.nama || m.programStudi || 'Tidak ada program studi'
        }));
    }
}
