
import { prisma } from '../lib/prisma.js';
import { getUserProfile } from '../middleware/auth.js';

export class DashboardService {
    static async getDashboardStats(params: {
        userId: string,
        userRole: string,
        semester?: string,
        angkatan?: string,
        kelasId?: string,
        mataKuliahId?: string,
        prodiId?: string // filter param
    }) {
        const { userId, userRole, semester, angkatan, kelasId, mataKuliahId, prodiId: filterProdiId } = params;

        // Define filters
        let userFilter: any = {};
        let cplFilter: any = { isActive: true };
        let mkFilter: any = { isActive: true };
        let nilaiFilter: any = {};
        let prodiId: string | null = null;

        // --- GLOBAL FILTER APPLICATION ---

        // 1. Semester Filter
        if (semester) {
            const sem = parseInt(semester);
            if (!isNaN(sem)) {
                nilaiFilter.semester = sem;
                mkFilter.semester = sem;
                if (!userFilter.profile) userFilter.profile = {};
                userFilter.profile.semester = sem;
            }
        }

        // 2. Angkatan Filter
        if (angkatan) {
            const year = parseInt(angkatan);
            if (!isNaN(year)) {
                if (!userFilter.profile) userFilter.profile = {};
                userFilter.profile.angkatanRef = { tahun: year };

                // Fix: Apply Angkatan filter to NilaiCpl aggregation
                nilaiFilter.mahasiswa = {
                    ...(nilaiFilter.mahasiswa || {}),
                    angkatanRef: { tahun: year }
                };
            }
        }

        // 3. Kelas Filter
        if (kelasId) {
            if (!userFilter.profile) userFilter.profile = {};
            userFilter.profile.kelasId = kelasId;

            // Fix: Apply Kelas filter to NilaiCpl aggregation
            nilaiFilter.mahasiswa = {
                ...(nilaiFilter.mahasiswa || {}),
                kelasId: kelasId
            };
        }

        // 4. Mata Kuliah Filter
        if (mataKuliahId) {
            nilaiFilter.mataKuliahId = mataKuliahId;
            mkFilter.id = mataKuliahId;
        }

        // 5. Prodi Filter (For Admin)
        if (userRole === 'admin' && filterProdiId && filterProdiId !== 'all') {
            prodiId = filterProdiId;
        }

        // --- ROLE BASED LOGIC ---

        if (userRole === 'kaprodi') {
            const profile = await getUserProfile(userId);
            if (profile && profile.prodiId) {
                prodiId = profile.prodiId;
            }
        }

        // Apply Prodi Filter if set (Admin selected or Kaprodi enforced)
        if (prodiId) {
            userFilter = {
                ...userFilter,
                role: { role: 'mahasiswa' },
            };
            if (!userFilter.profile) userFilter.profile = {};
            userFilter.profile.prodiId = prodiId;

            cplFilter = { ...cplFilter, prodiId };
            mkFilter = { ...mkFilter, prodiId };
            nilaiFilter = {
                ...nilaiFilter,
                mahasiswa: { prodiId }
            };
        } else if (userRole === 'admin') {
            // Admin without specific prodi filter sees all students
            userFilter = {
                ...userFilter,
                role: { role: 'mahasiswa' },
            };
        }

        // Dosen Specific Logic
        let customUserCount: number | null = null;
        if (userRole === 'dosen') {
            const pengampuRecords = await prisma.mataKuliahPengampu.findMany({
                where: { dosenId: userId },
                include: { mataKuliah: true }
            });

            const myMkIds = [...new Set(pengampuRecords.map(p => p.mataKuliahId))];

            if (mataKuliahId) {
                if (!myMkIds.includes(mataKuliahId)) {
                    mkFilter.id = "invalid_id";
                    nilaiFilter.mataKuliahId = "invalid_id";
                }
            } else {
                mkFilter = { ...mkFilter, id: { in: myMkIds } };
                nilaiFilter = { ...nilaiFilter, mataKuliahId: { in: myMkIds } };
            }

            // Calculate User Count for Dosen
            customUserCount = await prisma.profile.count({
                where: {
                    user: { role: { role: 'mahasiswa' } },
                    ...userFilter.profile
                }
            });
        }

        // --- DATA FETCHING ---

        const [dbUserCount, cplCount, mataKuliahCount, nilaiCount] = await Promise.all([
            prisma.user.count({ where: userFilter }),
            prisma.cpl.count({ where: cplFilter }),
            prisma.mataKuliah.count({ where: mkFilter }),
            prisma.nilaiCpl.count({ where: nilaiFilter })
        ]);

        const userCount = customUserCount !== null ? customUserCount : dbUserCount;

        // --- COMPLETENESS METRICS ---
        let completeness = {
            cplEmpty: 0,
            mkUnmapped: 0,
            dosenNoInput: 0,
            progressPengisian: 0
        };

        if (userRole !== 'mahasiswa') {
            const [cplEmpty, mkUnmapped] = await Promise.all([
                prisma.cpl.count({
                    where: {
                        ...cplFilter,
                        nilaiCpl: { none: {} }
                    }
                }),
                prisma.mataKuliah.count({
                    where: {
                        ...mkFilter,
                        cpmk: { none: {} }
                    }
                })
            ]);

            const studentsWithGrades = await prisma.nilaiCpl.groupBy({
                by: ['mahasiswaId'],
                where: nilaiFilter,
            });
            const progressPengisian = userCount > 0 ? (studentsWithGrades.length / userCount) * 100 : 0;

            completeness = {
                cplEmpty,
                mkUnmapped,
                dosenNoInput: 0,
                progressPengisian: parseFloat(progressPengisian.toFixed(1))
            };
        }

        // --- CHARTS & ANALYSIS ---

        // 1. CPL Average
        const cplAggregations = await prisma.nilaiCpl.groupBy({
            by: ['cplId'],
            where: nilaiFilter,
            _avg: { nilai: true }
        });

        const cpls = await prisma.cpl.findMany({
            where: { id: { in: cplAggregations.map(a => a.cplId) } },
            select: { id: true, kodeCpl: true }
        });
        const cplMap = new Map(cpls.map(c => [c.id, c.kodeCpl]));

        const chartData = cplAggregations.map(item => ({
            name: cplMap.get(item.cplId) || "Unknown",
            nilai: parseFloat((item._avg.nilai || 0).toFixed(2))
        }));

        // Global Average
        let avgScore = 0;
        if (chartData.length > 0) {
            const sum = chartData.reduce((acc, curr) => acc + curr.nilai, 0);
            avgScore = parseFloat((sum / chartData.length).toFixed(2));
        }

        // 2. Trend
        const semesterAggregations = await prisma.nilaiCpl.groupBy({
            by: ['semester'],
            where: nilaiFilter,
            _avg: { nilai: true }
        });
        const trendData = semesterAggregations
            .map(item => ({
                semester: `Sem ${item.semester}`,
                nilai: parseFloat((item._avg.nilai || 0).toFixed(2)),
                rawSemester: item.semester
            }))
            .sort((a, b) => a.rawSemester - b.rawSemester);

        // 3. Distribution
        const distExcellent = await prisma.nilaiCpl.count({ where: { ...nilaiFilter, nilai: { gte: 85 } } });
        const distGood = await prisma.nilaiCpl.count({ where: { ...nilaiFilter, nilai: { gte: 70, lt: 85 } } });
        const distFair = await prisma.nilaiCpl.count({ where: { ...nilaiFilter, nilai: { gte: 60, lt: 70 } } });
        const distPoor = await prisma.nilaiCpl.count({ where: { ...nilaiFilter, nilai: { lt: 60 } } });
        const distTotal = distExcellent + distGood + distFair + distPoor;

        const distributionData = [
            { name: "Sangat Baik (>85)", value: distExcellent, percentage: distTotal > 0 ? ((distExcellent / distTotal) * 100).toFixed(1) : "0.0" },
            { name: "Baik (70-85)", value: distGood, percentage: distTotal > 0 ? ((distGood / distTotal) * 100).toFixed(1) : "0.0" },
            { name: "Cukup (60-70)", value: distFair, percentage: distTotal > 0 ? ((distFair / distTotal) * 100).toFixed(1) : "0.0" },
            { name: "Kurang (<60)", value: distPoor, percentage: distTotal > 0 ? ((distPoor / distTotal) * 100).toFixed(1) : "0.0" }
        ];

        // 4. Performance (Top 5)
        const performanceData = [...chartData]
            .sort((a, b) => b.nilai - a.nilai)
            .slice(0, 5)
            .map(item => ({
                ...item,
                status: item.nilai >= 80 ? "Excellent" : item.nilai >= 70 ? "Good" : "Need Improvement"
            }));

        // --- ALERTS & INSIGHTS ---
        const alerts: any[] = [];
        const insights: any[] = [];

        if (userRole !== 'mahasiswa') {
            // Alert: Low CPL
            chartData.forEach(c => {
                if (c.nilai < 55) {
                    alerts.push({ type: 'danger', message: `CPL ${c.name} belum mencapai standar minimal (55). Nilai saat ini: ${c.nilai}` });
                } else if (c.nilai < 70) {
                    alerts.push({ type: 'warning', message: `CPL ${c.name} perlu ditingkatkan. Nilai saat ini: ${c.nilai}` });
                }
            });

            // Alert: Unmapped MK
            if (completeness.mkUnmapped > 0) {
                alerts.push({ type: 'warning', message: `${completeness.mkUnmapped} Mata Kuliah belum memiliki mapping CPMK.` });
            }

            // Insight: Highest/Lowest
            if (chartData.length > 0) {
                const sorted = [...chartData].sort((a, b) => b.nilai - a.nilai);
                const highest = sorted[0];
                const lowest = sorted[sorted.length - 1];
                insights.push({ type: 'success', message: `${highest.name} menjadi CPL dengan capaian tertinggi (${highest.nilai}).` });
                insights.push({ type: 'info', message: `${lowest.name} memiliki capaian terendah (${lowest.nilai}), perlu evaluasi.` });
            }

            // Insight: Trend
            if (trendData.length >= 2) {
                const last = trendData[trendData.length - 1];
                const prev = trendData[trendData.length - 2];
                const diff = last.nilai - prev.nilai;
                if (diff > 0) {
                    insights.push({ type: 'success', message: `Rata-rata nilai naik ${diff.toFixed(2)} poin dibanding semester lalu.` });
                } else if (diff < 0) {
                    insights.push({ type: 'warning', message: `Rata-rata nilai turun ${Math.abs(diff).toFixed(2)} poin dibanding semester lalu.` });
                }
            }
        }

        return {
            stats: {
                users: userCount,
                cpl: cplCount,
                mataKuliah: mataKuliahCount,
                nilai: nilaiCount,
                avgScore
            },
            completeness,
            chartData,
            trendData,
            distributionData,
            performanceData,
            alerts,
            insights
        };
    }

    static async getDosenAnalysis(prodiId?: string) {
        const where: any = { role: { role: 'dosen' } };

        if (prodiId && prodiId !== 'all') {
            where.profile = { prodiId: prodiId };
        }

        const dosenList = await prisma.user.findMany({
            where,
            include: {
                profile: {
                    include: {
                        mataKuliahPengampu: {
                            include: { mataKuliah: true, kelas: true }
                        }
                    }
                }
            }
        });

        return Promise.all(dosenList.map(async (dosen) => {
            const pengampu = dosen.profile?.mataKuliahPengampu || [];
            const mkIds = pengampu.map(p => p.mataKuliahId);

            // Avg Score given by this dosen
            const grades = await prisma.nilaiCpl.aggregate({
                where: { mataKuliahId: { in: mkIds } },
                _avg: { nilai: true },
                _count: { nilai: true }
            });

            let totalStudentsExpected = 0;
            let totalStudentsGraded = 0;

            for (const p of pengampu) {
                const mkId = p.mataKuliahId;
                const kelasId = p.kelasId;
                const mk = p.mataKuliah;

                // Count students expected for this mata kuliah
                // Match by: same prodi, same semester (from MK), and same kelas if specified
                const studentFilter: any = {
                    role: { role: 'mahasiswa' }
                };

                if (mk?.prodiId) studentFilter.profile = { prodiId: mk.prodiId };
                if (kelasId) {
                    studentFilter.profile = { ...studentFilter.profile, kelasId };
                }

                const expectedStudents = await prisma.user.count({ where: studentFilter });

                // Count distinct students who have been graded for this mata kuliah
                const gradedStudents = await prisma.nilaiCpl.groupBy({
                    by: ['mahasiswaId'],
                    where: { mataKuliahId: mkId }
                });

                totalStudentsExpected += expectedStudents;
                totalStudentsGraded += gradedStudents.length;
            }

            const avgVal = (grades._avg.nilai as any);
            const avgNum = avgVal ? Number(avgVal) : 0;

            // Calculate overall progress as percentage of students graded vs expected
            const progressInput = totalStudentsExpected > 0
                ? parseFloat(((totalStudentsGraded / totalStudentsExpected) * 100).toFixed(1))
                : 0;

            return {
                id: dosen.id,
                nama: dosen.profile?.namaLengkap || dosen.email,
                totalKelas: mkIds.length,
                avgNilai: parseFloat(avgNum.toFixed(2)),
                progressInput
            };
        }));
    }

    static async getStudentEvaluation(params: { prodiId?: string, angkatan?: string, semester?: string }) {
        const { prodiId, angkatan, semester } = params;
        const where: any = { role: { role: 'mahasiswa' } };
        const profileWhere: any = {};

        if (prodiId && prodiId !== 'all') profileWhere.prodiId = prodiId;
        if (semester) profileWhere.semester = parseInt(semester);
        if (angkatan) profileWhere.angkatanRef = { tahun: parseInt(angkatan) };

        where.profile = profileWhere;

        const students = await prisma.user.findMany({
            where,
            include: { profile: true },
            take: 100
        });

        const evaluation = await Promise.all(students.map(async (mhs) => {
            const scores = await prisma.nilaiCpl.groupBy({
                by: ['cplId'],
                where: { mahasiswaId: mhs.id },
                _avg: { nilai: true }
            });

            const avgScore = scores.length > 0
                ? scores.reduce((acc, curr) => {
                    const val = (curr._avg.nilai as any);
                    return acc + (val ? Number(val) : 0);
                }, 0) / scores.length
                : 0;

            const lowCplCount = scores.filter(s => {
                const val = (s._avg.nilai as any);
                return (val ? Number(val) : 0) < 55;
            }).length;

            return {
                id: mhs.id,
                nama: mhs.profile?.namaLengkap || mhs.email,
                nim: mhs.profile?.nim || '-',
                avgCpl: parseFloat(avgScore.toFixed(2)),
                lowCplCount
            };
        }));

        // Filter: Only show students with average CPL below 55 (at-risk students)
        const filteredEvaluation = evaluation.filter(e => e.avgCpl > 0 && e.avgCpl < 55);

        // Sort by most issues (lowCplCount desc), then by lowest average (avgCpl asc)
        filteredEvaluation.sort((a, b) => {
            if (b.lowCplCount !== a.lowCplCount) return b.lowCplCount - a.lowCplCount;
            return a.avgCpl - b.avgCpl;
        });

        return filteredEvaluation;
    }
}
