import { prisma } from '../lib/prisma.js';
import { TranskripService } from './TranskripService.js';

interface TargetParams {
    prodiId: string;
    angkatan: string;
    tahunAjaran: string;
    semester?: number;
}

interface UpsertTargetParams extends TargetParams {
    targets: { cplId: string; target: number }[];
}

interface TindakLanjutParams {
    prodiId: string;
    angkatan: string;
    tahunAjaran: string;
    semester?: number;
    cplId: string;
    akarMasalah: string;
    rencanaPerbaikan: string;
    penanggungJawab: string;
    targetSemester: string;
    createdBy: string;
}

export class EvaluasiCPLService {

    // --- TARGET MANAGEMENT ---

    static async getTargets(params: TargetParams) {
        const { prodiId, angkatan, tahunAjaran, semester } = params;

        const where: any = { prodiId, angkatan, tahunAjaran };
        if (semester) where.semester = semester;

        return prisma.targetCPL.findMany({
            where,
            include: { cpl: true }
        });
    }

    static async upsertTargets(params: UpsertTargetParams) {
        const { prodiId, angkatan, tahunAjaran, semester, targets } = params;

        const results = [];
        for (const t of targets) {
            try {
                // Manual upsert because Prisma upsert has issues with nullable unique fields in some DBs
                const existing = await prisma.targetCPL.findFirst({
                    where: {
                        prodiId,
                        angkatan,
                        tahunAjaran,
                        semester: semester || null,
                        cplId: t.cplId
                    }
                });

                let result;
                if (existing) {
                    result = await prisma.targetCPL.update({
                        where: { id: existing.id },
                        data: { target: t.target }
                    });
                } else {
                    result = await prisma.targetCPL.create({
                        data: {
                            prodiId,
                            angkatan,
                            tahunAjaran,
                            semester: semester || null,
                            cplId: t.cplId,
                            target: t.target
                        }
                    });
                }
                results.push(result);
            } catch (error) {
                console.error(`Error saving target for CPL ${t.cplId}:`, error);
                throw error; // Re-throw to be caught by controller
            }
        }
        return results;
    }

    // --- EVALUATION LOGIC ---

    static async getEvaluation(params: TargetParams) {
        const { prodiId, angkatan, tahunAjaran, semester } = params;

        try {
            // 1. Get Targets
            const targets = await this.getTargets(params);
            const targetMap = new Map(targets.map(t => [t.cplId, t.target]));

            // 2. Get Actual Scores (Average of students in this cohort)
            // We need to fetch students first
            const students = await prisma.profile.findMany({
                where: {
                    prodiId,
                    angkatanRef: { tahun: parseInt(angkatan) } // Assuming angkatan is year string
                },
                select: { userId: true }
            });

            const studentIds = students.map(s => s.userId);

            if (studentIds.length === 0) {
                return {
                    targets,
                    evaluation: [],
                    summary: { totalCpl: 0, tercapai: 0, tidakTercapai: 0 }
                };
            }

            // Calculate average CPL for this cohort
            // We want CUMULATIVE score, so we DO NOT filter by tahunAjaran of the grade.
            // The tahunAjaran param is used for Target and TindakLanjut context.
            // Calculate average CPL for this cohort
            // STRICT FILTERING: Filter by Tahun Ajaran and Semester if provided
            const whereNilai: any = {
                mahasiswaId: { in: studentIds }
            };
            if (tahunAjaran) whereNilai.tahunAjaranId = tahunAjaran;
            if (semester) whereNilai.semester = semester;


            // Fetch ALL scores to calculate detailed metrics in memory
            // (More flexible than groupBy for calculating % Pass per student)
            const allScores = await prisma.nilaiCpl.findMany({
                where: whereNilai,
                include: { mataKuliah: true }
            });


            // Get all CPLs for this prodi
            const allCpls = await prisma.cpl.findMany({
                where: { prodiId, isActive: true },
                include: {
                    tindakLanjutCPL: {
                        where: { prodiId, angkatan, tahunAjaran, semester: semester || null },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });

            const evaluation = allCpls.map(cpl => {
                const cplScores = allScores.filter(s => s.cplId === cpl.id);
                const target = targetMap.get(cpl.id) ?? 75.0;

                // 1. Calculate Actual Score (Average of all scores for this CPL)
                // Note: This averages all "course-cpl" entries. 
                // Alternatively, we could average per student first, then average the students.
                // Let's average per student first to be fairer (student as unit of analysis).

                const studentScoresMap = new Map<string, number[]>();
                cplScores.forEach(s => {
                    if (!studentScoresMap.has(s.mahasiswaId)) studentScoresMap.set(s.mahasiswaId, []);
                    studentScoresMap.get(s.mahasiswaId)?.push(Number(s.nilai));
                });

                let totalStudentAvg = 0;
                let passCount = 0;
                let studentCountForCpl = 0;

                studentScoresMap.forEach((scores) => {
                    const studentAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
                    totalStudentAvg += studentAvg;
                    if (studentAvg >= target) passCount++;
                    studentCountForCpl++;
                });

                const actual = studentCountForCpl > 0 ? totalStudentAvg / studentCountForCpl : 0;
                const passPercentage = studentCountForCpl > 0 ? (passCount / studentCountForCpl) * 100 : 0;
                const status = actual >= target ? 'Tercapai' : 'Tidak Tercapai';

                // 2. Course Breakdown
                const courseMap = new Map<string, { kode: string, name: string, total: number, count: number }>();
                cplScores.forEach(s => {
                    const mkId = s.mataKuliahId;
                    if (!courseMap.has(mkId)) {
                        courseMap.set(mkId, {
                            kode: s.mataKuliah.kodeMk,
                            name: s.mataKuliah.namaMk,
                            total: 0,
                            count: 0
                        });
                    }
                    const entry = courseMap.get(mkId)!;
                    entry.total += Number(s.nilai);
                    entry.count++;
                });

                const courseBreakdown = Array.from(courseMap.values()).map(c => ({
                    kodeMk: c.kode,
                    namaMk: c.name,
                    averageScore: Number((c.total / c.count).toFixed(2))
                })).sort((a, b) => a.averageScore - b.averageScore); // Sort by lowest score first (to highlight issues)

                return {
                    cplId: cpl.id,
                    kodeCpl: cpl.kodeCpl,
                    deskripsi: cpl.deskripsi,
                    target,
                    actual: Number(actual.toFixed(2)),
                    passPercentage: Number(passPercentage.toFixed(2)),
                    status,
                    courseBreakdown,
                    tindakLanjut: cpl.tindakLanjutCPL[0] || null
                };
            });

            return {
                params,
                studentCount: studentIds.length,
                evaluation,
                summary: {
                    totalCpl: evaluation.length,
                    tercapai: evaluation.filter(e => e.status === 'Tercapai').length,
                    tidakTercapai: evaluation.filter(e => e.status === 'Tidak Tercapai').length
                }
            };
        } catch (error) {
            console.error('Error in EvaluasiCPLService.getEvaluation:', error);
            // Log stack trace if available
            if (error instanceof Error) {
                console.error(error.stack);
            }
            throw error;
        }
    }

    // --- TINDAK LANJUT ---

    static async createTindakLanjut(data: any) {
        const payload = { ...data };

        // Ensure tahunAjaran is present
        if (payload.tahunAjaranId && !payload.tahunAjaran) {
            payload.tahunAjaran = payload.tahunAjaranId;
        }
        delete payload.tahunAjaranId;

        // Ensure semester is Int or null
        const sem = payload.semester ? Number(payload.semester) : null;

        return prisma.tindakLanjutCPL.create({
            data: {
                prodiId: payload.prodiId,
                angkatan: payload.angkatan,
                tahunAjaran: payload.tahunAjaran,
                semester: sem,
                cplId: payload.cplId,
                akarMasalah: payload.akarMasalah,
                rencanaPerbaikan: payload.rencanaPerbaikan,
                penanggungJawab: payload.penanggungJawab,
                targetSemester: payload.targetSemester,
                createdBy: payload.createdBy
            }
        });
    }

    static async getTindakLanjutHistory(prodiId: string, cplId?: string, status?: string) {
        const where: any = { prodiId };
        if (cplId) where.cplId = cplId;
        if (status) where.status = status;

        return (prisma.tindakLanjutCPL as any).findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                cpl: true,
                creator: {
                    include: {
                        profile: true
                    }
                }
            }
        });
    }

    static async updateTindakLanjutStatus(id: string, status: string) {
        return prisma.tindakLanjutCPL.update({
            where: { id },
            data: { status }
        });
    }
}
