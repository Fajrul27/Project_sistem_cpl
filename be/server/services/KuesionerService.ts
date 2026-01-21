
import { prisma } from '../lib/prisma.js';
import { gradingSchemas } from '../schemas/grading.schema.js';
import { Prisma } from '@prisma/client';

export class KuesionerService {
    static async getMyKuesioner(userId: string, semester: number, tahunAjaranId?: string) {
        const where: any = {
            mahasiswaId: userId,
            semester
        };

        if (tahunAjaranId) {
            where.tahunAjaranId = tahunAjaranId;
        }

        return prisma.penilaianTidakLangsung.findMany({
            where,
            include: { cpl: true }
        });
    }

    static async submitKuesioner(userId: string, data: any) {
        const validated = gradingSchemas.kuesioner.parse(data);
        return prisma.$transaction(
            validated.nilai.map(item =>
                prisma.penilaianTidakLangsung.upsert({
                    where: {
                        mahasiswaId_cplId_semester_tahunAjaranId: {
                            mahasiswaId: userId,
                            cplId: item.cplId,
                            semester: validated.semester,
                            tahunAjaranId: validated.tahunAjaranId
                        }
                    },
                    update: { nilai: item.nilai },
                    create: {
                        mahasiswaId: userId,
                        cplId: item.cplId,
                        semester: validated.semester,
                        tahunAjaranId: validated.tahunAjaranId,
                        nilai: item.nilai
                    }
                })
            )
        );
    }

    static async getKuesionerStats(params: {
        userId: string,
        userRole: string,
        prodiId?: string,
        tahunAjaranId?: string,
        semester?: string,
        fakultasId?: string
    }) {
        const { userId, userRole, prodiId, tahunAjaranId, semester, fakultasId } = params;
        const whereClause: Prisma.PenilaianTidakLangsungWhereInput = {};

        // 1. Apply Tahun Ajaran
        if (tahunAjaranId && tahunAjaranId !== 'all') {
            whereClause.tahunAjaranId = tahunAjaranId;
        }

        // 2. Apply Semester
        if (semester && semester !== 'all' && semester !== 'undefined') {
            const semInt = parseInt(semester);
            if (!isNaN(semInt)) whereClause.semester = semInt;
        }

        // 3. Apply Role-Based Logic strategy
        if (userRole === 'mahasiswa') {
            whereClause.mahasiswa = { userId };
        } else if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (!profile?.prodiId) throw new Error('INVALID_PRODI');

            whereClause.mahasiswa = { prodiId: profile.prodiId };
        } else if (userRole === 'admin') {
            // Admin Filter Logic
            if (prodiId && prodiId !== 'all') {
                whereClause.mahasiswa = { prodiId };
            } else if (fakultasId && fakultasId !== 'all') {
                whereClause.mahasiswa = { prodi: { fakultasId } };
            } else {
                // DEFAULT ADMIN VIEW:
                // Must force a join on Profile table to ensure data visibility.
                // Using userId ensuring we hit the FK index.
                whereClause.mahasiswa = { userId: { not: '' } };
            }
        }


        const stats = await prisma.penilaianTidakLangsung.groupBy({
            by: ['cplId'],
            where: whereClause,
            _avg: { nilai: true },
            _count: { nilai: true }
        });

        const cpls = await prisma.cpl.findMany({
            where: { id: { in: stats.map(s => s.cplId) } },
            select: { id: true, kodeCpl: true, deskripsi: true }
        });

        return stats.map(s => {
            const cpl = cpls.find(c => c.id === s.cplId);
            return {
                cplId: s.cplId,
                kodeCpl: cpl?.kodeCpl || 'Unknown',
                deskripsi: cpl?.deskripsi || '',
                rataRata: s._avg.nilai ? Number(s._avg.nilai) : 0,
                jumlahResponden: s._count.nilai
            };
        });
    }
}
