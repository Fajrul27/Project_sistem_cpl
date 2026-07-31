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

        // Determine if the passed `tahunAjaran` is a kurikulumId or a tahunAjaranId
        let kurikulumIds: string[] = [];
        
        if (tahunAjaran) {
            // 1. Check if the passed tahunAjaran is a valid Kurikulum ID
            const isKurikulum = await prisma.kurikulum.findUnique({
                where: { id: tahunAjaran }
            });

            if (isKurikulum) {
                kurikulumIds = [tahunAjaran];
            } else {
                // 2. If it's a TahunAjaran ID (from evaluation), find the kurikulum(s) associated with this prodi's active CPLs
                const cpls = await prisma.cpl.findMany({
                    where: { prodiId, isActive: true },
                    select: { kurikulumId: true }
                });
                kurikulumIds = Array.from(new Set(cpls.map(c => c.kurikulumId).filter((id): id is string => !!id)));
            }
        } else {
             // Fallback if no tahunAjaran provided: just get all kurikulum for active CPLs
             const cpls = await prisma.cpl.findMany({
                 where: { prodiId, isActive: true },
                 select: { kurikulumId: true }
             });
             kurikulumIds = Array.from(new Set(cpls.map(c => c.kurikulumId).filter((id): id is string => !!id)));
        }

        const where: any = { 
            prodiId, 
            angkatan
        };
        
        if (tahunAjaran) {
            where.tahunAjaran = { in: [...kurikulumIds, tahunAjaran] };
        } else {
            where.tahunAjaran = { in: [...kurikulumIds] };
        }

        if (semester) {
            where.OR = [
                { semester: semester },
                { semester: null }
            ];
        }

        const targets = await prisma.targetCPL.findMany({
            where,
            include: { cpl: true }
        });

        if (semester) {
            // Filter targets to prioritize semester-specific over cohort general targets (semester = null)
            const targetMap = new Map<string, typeof targets[0]>();
            
            // First, populate with general targets (semester === null)
            targets.forEach(t => {
                if (t.semester === null) {
                    targetMap.set(t.cplId, t);
                }
            });
            
            // Then, overwrite/add semester-specific targets
            targets.forEach(t => {
                if (t.semester !== null) {
                    targetMap.set(t.cplId, t);
                }
            });
            
            return Array.from(targetMap.values());
        }

        return targets;
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
            const rawScores = await prisma.nilaiCpl.findMany({
                where: whereNilai,
                include: { mataKuliah: true }
            });

            // 1. Deduplicate: Get BEST score if student retakes a class
            const bestScoreMap = new Map<string, typeof rawScores[0]>();
            for (const r of rawScores) {
                const key = `${r.mahasiswaId}|${r.mataKuliahId}|${r.cplId}`;
                const currentVal = Number(r.nilai);
                if (!bestScoreMap.has(key) || currentVal > Number(bestScoreMap.get(key)!.nilai)) {
                    bestScoreMap.set(key, r);
                }
            }
            const allScores = Array.from(bestScoreMap.values());

            // 2. Fetch Weights (Bobot)
            const allCplIds = [...new Set(allScores.map(s => s.cplId))];
            const allMkIds = [...new Set(allScores.map(s => s.mataKuliahId))];
            const weightMappings = await prisma.cplMataKuliah.findMany({
                where: {
                    cplId: { in: allCplIds },
                    mataKuliahId: { in: allMkIds }
                },
                select: { cplId: true, mataKuliahId: true, bobotKontribusi: true }
            });
            const weightMap = new Map<string, number>();
            weightMappings.forEach(w => weightMap.set(`${w.cplId}|${w.mataKuliahId}`, Number(w.bobotKontribusi)));

            // Get all CPLs for this prodi
            const allCpls = await prisma.cpl.findMany({
                where: { prodiId, isActive: true },
                orderBy: { kodeCpl: 'asc' },
                include: {
                    tindakLanjutCPL: {
                        where: { prodiId, angkatan, tahunAjaran, semester: semester || null },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });

            // Fetch all mapped courses for roadmap
            const cpmkMappingsRaw = await prisma.cpmkCplMapping.findMany({
                where: { cplId: { in: allCpls.map(c => c.id) } },
                include: { cpmk: { include: { mataKuliah: true } } }
            });

            const mappedCoursesMap = new Map<string, any[]>();
            cpmkMappingsRaw.forEach(mapping => {
                const mk = mapping.cpmk.mataKuliah;
                if (!mk) return;
                if (!mappedCoursesMap.has(mapping.cplId)) mappedCoursesMap.set(mapping.cplId, []);
                const courses = mappedCoursesMap.get(mapping.cplId)!;
                if (!courses.find(c => c.mataKuliahId === mk.id)) {
                    courses.push({ cplId: mapping.cplId, mataKuliahId: mk.id, mataKuliah: mk });
                }
            });

            const evaluation = allCpls.map(cpl => {
                const cplScores = allScores.filter(s => s.cplId === cpl.id);
                const target = targetMap.get(cpl.id) ?? 75.0;

                // 1. Calculate Actual Score (Weighted average per student)
                const studentScoresMap = new Map<string, { totalScore: number; totalWeight: number }>();
                
                cplScores.forEach(s => {
                    const weightKey = `${s.cplId}|${s.mataKuliahId}`;
                    const bobot = weightMap.get(weightKey) ?? 1.0;
                    const sks = s.mataKuliah?.sks || 0;
                    const nilai = Number(s.nilai);

                    if (!studentScoresMap.has(s.mahasiswaId)) {
                        studentScoresMap.set(s.mahasiswaId, { totalScore: 0, totalWeight: 0 });
                    }
                    
                    const entry = studentScoresMap.get(s.mahasiswaId)!;
                    entry.totalScore += nilai * bobot * sks;
                    entry.totalWeight += bobot * sks;
                });

                let totalStudentAvg = 0;
                let passCount = 0;
                let studentCountForCpl = 0;

                studentScoresMap.forEach((data) => {
                    const studentAvg = data.totalWeight > 0 ? data.totalScore / data.totalWeight : 0;
                    totalStudentAvg += studentAvg;
                    if (studentAvg >= target) passCount++;
                    studentCountForCpl++;
                });

                const actual = studentCountForCpl > 0 ? totalStudentAvg / studentCountForCpl : 0;
                const passPercentage = studentCountForCpl > 0 ? (passCount / studentCountForCpl) * 100 : 0;
                const status = actual >= target ? 'Tercapai' : 'Tidak Tercapai';

                // 2. Course Breakdown (Calculate weighted average per course for all students)
                const courseMap = new Map<string, { kode: string, name: string, totalScore: number, count: number }>();
                
                const mappedCourses = mappedCoursesMap.get(cpl.id) || [];
                mappedCourses.forEach(mc => {
                    courseMap.set(mc.mataKuliahId, {
                        kode: mc.mataKuliah.kodeMk,
                        name: mc.mataKuliah.namaMk,
                        totalScore: 0,
                        count: 0
                    });
                });

                cplScores.forEach(s => {
                    const mkId = s.mataKuliahId;
                    if (!courseMap.has(mkId)) {
                        courseMap.set(mkId, {
                            kode: s.mataKuliah?.kodeMk || '',
                            name: s.mataKuliah?.namaMk || '',
                            totalScore: 0,
                            count: 0
                        });
                    }
                    const cInfo = courseMap.get(mkId)!;
                    cInfo.totalScore += Number(s.nilai);
                    cInfo.count++;
                });

                const courseBreakdown = Array.from(courseMap.values()).map(c => ({
                    kodeMk: c.kode,
                    namaMk: c.name,
                    averageScore: c.count > 0 ? Number((c.totalScore / c.count).toFixed(2)) : 0
                })).sort((a, b) => {
                    if (a.averageScore === 0 && b.averageScore > 0) return 1;
                    if (b.averageScore === 0 && a.averageScore > 0) return -1;
                    return a.averageScore - b.averageScore;
                });
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
                picId: payload.picId,
                targetSemester: payload.targetSemester,
                createdBy: payload.createdBy
            }
        });
    }

    static async getTindakLanjutByPic(picId: string) {
        return (prisma.tindakLanjutCPL as any).findMany({
            where: { picId },
            orderBy: { createdAt: 'desc' },
            include: {
                cpl: true,
                users: {
                    include: {
                        profile: true
                    }
                }
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
                users: {
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
