
import { prisma } from '../lib/prisma.js';
import { gradingSchemas } from '../schemas/grading.schema.js';
import { Prisma } from '@prisma/client';

export class KuesionerService {
    static async getMyKuesioner(userId: string, semester: number, tahunAjaran: string) {
        return prisma.penilaianTidakLangsung.findMany({
            where: {
                mahasiswaId: userId,
                semester,
                tahunAjaran
            },
            include: { cpl: true }
        });
    }

    static async submitKuesioner(userId: string, data: any) {
        const validated = gradingSchemas.kuesioner.parse(data);
        return prisma.$transaction(
            validated.nilai.map(item =>
                prisma.penilaianTidakLangsung.upsert({
                    where: {
                        mahasiswaId_cplId_semester_tahunAjaran: {
                            mahasiswaId: userId,
                            cplId: item.cplId,
                            semester: validated.semester,
                            tahunAjaran: validated.tahunAjaran
                        }
                    },
                    update: { nilai: item.nilai },
                    create: {
                        mahasiswaId: userId,
                        cplId: item.cplId,
                        semester: validated.semester,
                        tahunAjaran: validated.tahunAjaran,
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
        tahunAjaran?: string,
        semester?: string,
        fakultasId?: string
    }) {
        const { userId, userRole, prodiId, tahunAjaran, semester, fakultasId } = params;
        const whereClause: Prisma.PenilaianTidakLangsungWhereInput = {};

        // 1. Normalize and Apply Tahun Ajaran
        if (tahunAjaran && tahunAjaran !== 'all') {
            let ta = String(tahunAjaran).replace(/\+/g, ' ').trim();
            // Fuzzy fix for known encoding issues
            if (ta.includes('2024') && ta.includes('2025') && ta.toLowerCase().includes('ganjil')) {
                ta = "2024/2025 Ganjil";
            } else if (ta.includes('2023') && ta.includes('2024') && ta.toLowerCase().includes('genap')) {
                ta = "2023/2024 Genap";
            }
            whereClause.tahunAjaran = ta;
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
                // console.log('[KuesionerStats] Applying FORCE JOIN on Profile (userId check)');
                whereClause.mahasiswa = { userId: { not: '' } };
            }
        }

        // console.log(`[KuesionerStats] Fetching stats for ${userRole}. TA: ${whereClause.tahunAjaran || 'All'}`);
        // console.log(`[KuesionerStats] Final Where:`, JSON.stringify(whereClause, null, 2));

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
