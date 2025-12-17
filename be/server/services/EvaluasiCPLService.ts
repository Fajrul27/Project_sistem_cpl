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
        console.log(`EvaluasiCPLService.upsertTargets: Saving ${targets.length} targets for Prodi ${prodiId}, Angkatan ${angkatan}, TA ${tahunAjaran}, Sem ${semester}`);

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
        console.log('EvaluasiCPLService.getEvaluation called with:', params);
        const { prodiId, angkatan, tahunAjaran, semester } = params;

        try {
            // 1. Get Targets
            console.log('Fetching targets...');
            const targets = await this.getTargets(params);
            const targetMap = new Map(targets.map(t => [t.cplId, t.target]));
            console.log(`Found ${targets.length} targets`);

            // 2. Get Actual Scores (Average of students in this cohort)
            // We need to fetch students first
            console.log('Fetching students...');
            const students = await prisma.profile.findMany({
                where: {
                    prodiId,
                    angkatanRef: { tahun: parseInt(angkatan) } // Assuming angkatan is year string
                },
                select: { userId: true }
            });

            const studentIds = students.map(s => s.userId);
            console.log(`Found ${studentIds.length} students:`, studentIds);

            if (studentIds.length === 0) {
                console.log('No students found for this cohort, returning empty evaluation.');
                return {
                    targets,
                    evaluation: [],
                    summary: { totalCpl: 0, tercapai: 0, tidakTercapai: 0 }
                };
            }

            // Calculate average CPL for this cohort
            // We want CUMULATIVE score, so we DO NOT filter by tahunAjaran of the grade.
            // The tahunAjaran param is used for Target and TindakLanjut context.
            const whereNilai: any = {
                mahasiswaId: { in: studentIds }
            };
            if (semester) whereNilai.semester = semester;

            console.log('Aggregating scores with filter:', JSON.stringify(whereNilai, null, 2));
            const aggregations = await prisma.nilaiCpl.groupBy({
                by: ['cplId'],
                _avg: { nilai: true },
                where: whereNilai
            });
            console.log(`Aggregation result count: ${aggregations.length}`);
            console.log('Raw Aggregation Data:', JSON.stringify(aggregations, null, 2));

            // Get all CPLs for this prodi to ensure we show even those with 0 score
            console.log('Fetching all CPLs...');
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
            console.log(`Found ${allCpls.length} CPLs`);

            const evaluation = allCpls.map(cpl => {
                const avgVal = aggregations.find(a => a.cplId === cpl.id)?._avg.nilai;

                // Safe Decimal conversion
                let actual = 0;
                if (avgVal) {
                    if (typeof avgVal === 'object' && 'toNumber' in avgVal) {
                        actual = (avgVal as any).toNumber();
                    } else {
                        actual = Number(avgVal);
                    }
                }

                const target = targetMap.get(cpl.id) ?? 75.0; // Default target if not set
                const status = actual >= target ? 'Tercapai' : 'Tidak Tercapai';

                return {
                    cplId: cpl.id,
                    kodeCpl: cpl.kodeCpl,
                    deskripsi: cpl.deskripsi,
                    target,
                    actual: Number(actual.toFixed(2)),
                    status,
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

    static async createTindakLanjut(data: TindakLanjutParams) {
        return prisma.tindakLanjutCPL.create({
            data: {
                ...data,
                semester: data.semester || null
            }
        });
    }

    static async getTindakLanjutHistory(cplId: string, prodiId: string) {
        return prisma.tindakLanjutCPL.findMany({
            where: { cplId, prodiId },
            orderBy: { createdAt: 'desc' },
            include: { cpl: true }
        });
    }
}
