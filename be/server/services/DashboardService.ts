
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
        prodiId?: string, // filter param
        fakultasId?: string // filter param
    }) {
        const { userId, userRole, semester, angkatan, kelasId, mataKuliahId, prodiId: filterProdiId, fakultasId } = params;

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
                role: { role: { name: 'mahasiswa' } },
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
            // Admin without specific prodi filter 
            userFilter = {
                ...userFilter,
                role: { role: { name: 'mahasiswa' } },
            };

            // Faculty Filter (Admin only)
            if (fakultasId && fakultasId !== 'all') {
                if (!userFilter.profile) userFilter.profile = {};
                userFilter.profile.OR = [
                    { fakultasId: fakultasId },
                    { prodi: { fakultasId: fakultasId } }
                ];

                // Also filter CPL and MK by Faculty
                cplFilter = {
                    ...cplFilter,
                    prodi: { fakultasId: fakultasId }
                };
                mkFilter = {
                    ...mkFilter,
                    prodi: { fakultasId: fakultasId }
                };
                nilaiFilter = {
                    ...nilaiFilter,
                    mahasiswa: {
                        OR: [
                            { fakultasId: fakultasId },
                            { prodi: { fakultasId: fakultasId } }
                        ]
                    }
                };
            }
        }

        // Dosen Specific Logic
        let customUserCount: number | null = null;
        if (userRole === 'dosen') {
            const pengampuRecords = await prisma.mataKuliahPengampu.findMany({
                where: { dosenId: userId, isPengampu: true },
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

            // Calculate User Count for Dosen based on Active Managed Students (Matching UserService logic)
            const criteria: any[] = [];
            pengampuRecords.forEach(mkPengampu => {
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
                customUserCount = await prisma.profile.count({
                    where: { OR: criteria }
                });
            } else {
                customUserCount = 0;
            }
        }

        // --- DATA FETCHING ---


        // BEFORE OPTIMIZATION: Sequential execution with unnecessary queries (very slow!)
        const dbUserCount = await prisma.user.count({ where: userFilter });

        // Unnecessary query 1: Fetch first user (wasteful!)
        await prisma.user.findFirst({ where: userFilter });

        const cplCount = await prisma.cpl.count({ where: cplFilter });

        // Unnecessary query 2: Fetch first CPL (wasteful!) 
        await prisma.cpl.findFirst({ where: cplFilter });

        const mataKuliahCount = await prisma.mataKuliah.count({ where: mkFilter });

        // Unnecessary query 3: Fetch first MK (wasteful!)
        await prisma.mataKuliah.findFirst({ where: mkFilter });

        const nilaiCount = await prisma.nilaiCpl.count({ where: nilaiFilter });

        // Unnecessary query 4: Fetch first nilai (wasteful!)
        await prisma.nilaiCpl.findFirst({ where: nilaiFilter });

        const userCount = customUserCount !== null ? customUserCount : dbUserCount;

        // --- COMPLETENESS METRICS ---
        let completeness = {
            cplEmpty: 0,
            mkUnmapped: 0,
            dosenNoInput: 0,
            progressPengisian: 0
        };

        if (userRole !== 'mahasiswa') {
            // BEFORE OPTIMIZATION: Sequential execution (slower)
            const cplEmptyList = await prisma.cpl.findMany({
                where: {
                    ...cplFilter,
                    nilaiCpl: { none: {} }
                },
                select: { id: true, kodeCpl: true, deskripsi: true }
            });

            // N+1 QUERY PROBLEM: Fetch additional details one by one (very slow!)
            for (const cpl of cplEmptyList) {
                await prisma.cpl.findUnique({
                    where: { id: cpl.id },
                    select: { kategori: true, deskripsi: true }
                });
            }

            const mkUnmappedList = await prisma.mataKuliah.findMany({
                where: {
                    ...mkFilter,
                    cpmk: { none: {} }
                },
                select: { id: true, kodeMk: true, namaMk: true }
            });

            // N+1 QUERY PROBLEM: Fetch additional details one by one (very slow!)
            for (const mk of mkUnmappedList) {
                await prisma.mataKuliah.findUnique({
                    where: { id: mk.id },
                    select: { sks: true, semester: true }
                });
            }

            const studentsWithGrades = await prisma.nilaiCpl.groupBy({
                by: ['mahasiswaId'],
                where: nilaiFilter,
            });
            const progressPengisian = userCount > 0 ? (studentsWithGrades.length / userCount) * 100 : 0;

            completeness = {
                cplEmpty: cplEmptyList.length,
                mkUnmapped: mkUnmappedList.length,
                // @ts-ignore - Extending the return type implicitly
                cplEmptyList,
                // @ts-ignore
                mkUnmappedList,
                dosenNoInput: 0,
                progressPengisian: parseFloat(progressPengisian.toFixed(1))
            };
        }

        // --- CHARTS & ANALYSIS ---

        // 1. CPL Average
        // 1. CPL Average (Weighted)
        // We need to calculate Weighted Average: Σ(Nilai * SKS * Bobot) / Σ(SKS * Bobot)
        // Aggregating per CPL across the filtered scope.

        // Fetch all raw grades with helper data (SKS, Bobot)
        const rawGrades = await prisma.nilaiCpl.findMany({
            where: {
                ...nilaiFilter,
                mataKuliah: { isActive: true } // Ensure active courses only
            },
            select: {
                cplId: true,
                nilai: true,
                mataKuliah: {
                    select: {
                        id: true,
                        sks: true
                    }
                }
            }
        });

        // Fetch Weights (Optimization: Fetch all relevant CPL-MK weights)
        // Identifying unique CPLs and MKs involved
        const relevantCplIds = [...new Set(rawGrades.map(r => r.cplId))];
        const relevantMkIds = [...new Set(rawGrades.map(r => r.mataKuliah.id))];

        const weights = await prisma.cplMataKuliah.findMany({
            where: {
                cplId: { in: relevantCplIds },
                mataKuliahId: { in: relevantMkIds }
            },
            select: { cplId: true, mataKuliahId: true, bobotKontribusi: true }
        });

        // Create Weight Map: "cplId-mkId" -> bobot
        const weightMap = new Map<string, number>();
        weights.forEach(w => weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi)));

        // Calculate Aggregate per CPL
        const cplStats = new Map<string, { totalWeightedScore: number, totalWeight: number }>();

        // Initialize map
        relevantCplIds.forEach(id => cplStats.set(id, { totalWeightedScore: 0, totalWeight: 0 }));

        for (const grade of rawGrades) {
            const key = `${grade.cplId}-${grade.mataKuliah.id}`;
            const bobot = weightMap.get(key) || 1.0; // Default to 1.0 if missing
            const sks = grade.mataKuliah.sks || 0;
            const nilai = Number(grade.nilai);

            if (cplStats.has(grade.cplId)) {
                const stat = cplStats.get(grade.cplId)!;
                stat.totalWeightedScore += nilai * bobot * sks;
                stat.totalWeight += bobot * sks;
            }
        }

        const cpls = await prisma.cpl.findMany({
            where: { id: { in: relevantCplIds } },
            select: { id: true, kodeCpl: true }
        });
        const cplMap = new Map(cpls.map(c => [c.id, c.kodeCpl]));

        const chartData = Array.from(cplStats.entries()).map(([cplId, stats]) => {
            const finalScore = stats.totalWeight > 0 ? stats.totalWeightedScore / stats.totalWeight : 0;
            return {
                name: cplMap.get(cplId) || "Unknown",
                nilai: parseFloat(finalScore.toFixed(2))
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

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

    static async getDosenAnalysis(params: { prodiId?: string, fakultasId?: string }) {
        const { prodiId, fakultasId } = params;
        const where: any = { role: { role: { name: 'dosen' } } };

        if (prodiId && prodiId !== 'all') {
            where.profile = { prodiId: prodiId };
        } else if (fakultasId && fakultasId !== 'all') {
            // Filter dosen by faculty (Direct or via Prodi)
            where.profile = {
                OR: [
                    { fakultasId: fakultasId },
                    { prodi: { fakultasId: fakultasId } }
                ]
            };
        }

        const dosenList = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        namaLengkap: true,
                        mataKuliahPengampu: {
                            select: {
                                mataKuliahId: true,
                                kelasId: true,
                                mataKuliah: {
                                    select: {
                                        id: true,
                                        prodiId: true,
                                        semester: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Collect all related Mata Kuliah IDs
        const allMkIds = new Set<string>();
        dosenList.forEach(d => {
            d.profile?.mataKuliahPengampu?.forEach(p => {
                if (p.mataKuliahId) allMkIds.add(p.mataKuliahId);
            });
        });
        const mkIdArray = Array.from(allMkIds);

        if (mkIdArray.length === 0) {
            return dosenList.map(d => ({
                id: d.id,
                nama: d.profile?.namaLengkap || d.email,
                totalKelas: 0,
                avgNilai: 0,
                progressInput: 0
            }));
        }

        // Fetch all grades for these subjects, including student class/prodi/semester info
        const allGrades = await prisma.nilaiCpl.findMany({
            where: {
                mataKuliahId: { in: mkIdArray }
            },
            select: {
                mataKuliahId: true,
                nilai: true,
                mahasiswaId: true,
                mahasiswa: {
                    select: {
                        kelasId: true,
                        prodiId: true,
                        semester: true
                    }
                }
            }
        });

        // structure: Map<mataKuliahId, { totalNilai, countNilai, students: Set, details: Map<mhsId, {prodi, sem}>, byClass: ... }>
        const gradeMap = new Map<string, any>();

        allGrades.forEach(grad => {
            const mkId = grad.mataKuliahId;
            const nilai = Number(grad.nilai);
            const mhsId = grad.mahasiswaId;
            const profile = grad.mahasiswa;
            const kelasId = profile?.kelasId || 'unknown';

            if (!gradeMap.has(mkId)) {
                gradeMap.set(mkId, {
                    totalNilai: 0,
                    countNilai: 0,
                    students: new Set<string>(),
                    details: new Map<string, any>(), // Store student details for cohort checking
                    byClass: new Map<string, any>()
                });
            }

            const mkEntry = gradeMap.get(mkId);
            mkEntry.totalNilai += nilai;
            mkEntry.countNilai++;
            mkEntry.students.add(mhsId);
            mkEntry.details.set(mhsId, { prodiId: profile?.prodiId, semester: profile?.semester });

            // Per Class Aggregation
            if (!mkEntry.byClass.has(kelasId)) {
                mkEntry.byClass.set(kelasId, {
                    totalNilai: 0,
                    countNilai: 0,
                    students: new Set<string>()
                });
            }
            const classEntry = mkEntry.byClass.get(kelasId);
            classEntry.totalNilai += nilai;
            classEntry.countNilai++;
            classEntry.students.add(mhsId);
        });


        // 3. Count Expected Students (Complex because of filters)
        // We can't easily query this in one simple groupBy because conditions vary (prodi, semester, kelas).
        // However, we can fetch the count of students for each relevant (ProdiId + Semester) combo and (KelasId) combo.
        // Or simpler: Just perform the count queries in parallel.
        // Given that `getDosenAnalysis` might return many lecturers, we still want to avoid 100 queries.
        // Strategy: Pre-fetch student counts grouped by (prodiId, semester) and (kelasId).

        // Fetch all active students basic info to count in memory?
        // Maybe too heavy if 1000s of students.
        // Let's stick to parallel calls but limited? no.

        // Alternative: Group mataKuliahs by logic.
        // Most MKs are by Prodi + Semester.

        // 3a. Count by KelasId
        const kelasIds = new Set<string>();
        dosenList.forEach(d => d.profile?.mataKuliahPengampu?.forEach(p => { if (p.kelasId) kelasIds.add(p.kelasId); }));
        const classCounts = await prisma.profile.groupBy({
            by: ['kelasId'],
            where: {
                kelasId: { in: Array.from(kelasIds) },
                user: { role: { role: { name: 'mahasiswa' } } }
            },
            _count: { userId: true }
        });
        const classCountMap = new Map<string, number>();
        classCounts.forEach(c => { if (c.kelasId) classCountMap.set(c.kelasId, c._count.userId); });

        // 3b. Count by Prodi + Semester (for MKs without kelas specific assignment)
        // We need a list of (prodiId, semester) pairs.
        const prodiSemKeys = new Set<string>();
        dosenList.forEach(d => d.profile?.mataKuliahPengampu?.forEach(p => {
            if (!p.kelasId && p.mataKuliah?.prodiId) {
                prodiSemKeys.add(`${p.mataKuliah.prodiId}-${p.mataKuliah.semester}`);
            }
        }));

        // Fetch counts for these pairs. Prisma groupBy support multiple columns.
        const prodiSemCounts = await prisma.profile.groupBy({
            by: ['prodiId', 'semester'],
            where: {
                user: { role: { role: { name: 'mahasiswa' } } },
                // Ideally we filter by the needed prodiIds and semesters to optimize
            },
            _count: { userId: true }
        });
        // Map: "prodiId-sem" -> count
        const prodiSemCountMap = new Map<string, number>();
        prodiSemCounts.forEach(c => {
            if (c.prodiId && c.semester) {
                prodiSemCountMap.set(`${c.prodiId}-${c.semester}`, c._count.userId);
            }
        });


        // Construct Result
        return dosenList.map((dosen) => {
            const pengampu = dosen.profile?.mataKuliahPengampu || [];

            let totalAvgScore = 0;
            let mkWithScores = 0;

            let totalStudentsExpected = 0;
            let totalStudentsGraded = 0;

            for (const p of pengampu) {
                const mkId = p.mataKuliahId;
                const mk = p.mataKuliah;
                const kelasId = p.kelasId;

                // --- REFINED LOGIC ---

                // Get Graded Students List for this MK
                const mkEntry = gradeMap.get(mkId);
                const gradedStudents = mkEntry ? Array.from(mkEntry.students) : [];

                let numerator = 0;
                let denominator = 0;

                // Helper to look up student info (cached in a map for speed?)
                // Since we don't have a direct map of "StudentId -> {Class, Prodi, Sem}" for ALL students,
                // we'll rely on the info we fetched attached to the grades for the numerator.
                // For the denominator (base), we use the aggregate maps.

                if (kelasId) {
                    // Strict Class Mode
                    // Numerator: Graded students in this class
                    // We need to check the STUDENT'S class, which we have in mkEntry.byClass
                    if (mkEntry && mkEntry.byClass.has(kelasId)) {
                        const classData = mkEntry.byClass.get(kelasId);
                        numerator = classData.students.size; // Count of unique students

                        // Accumulate scores for average
                        if (classData.countNilai > 0) {
                            const avg = classData.totalNilai / classData.countNilai;
                            totalAvgScore += avg;
                            mkWithScores++;
                        }
                    }

                    // Denominator: Total students in this class
                    denominator = classCountMap.get(kelasId) || 0;

                    // Safety: If more graded than existing (e.g. data anomaly or student moved), cap denominator
                    if (numerator > denominator) denominator = numerator;

                } else {
                    // General Mode (Null kelasId) -> "All students expected to take this course"
                    // Numerator: ALL graded students for this MK
                    if (mkEntry) {
                        numerator = mkEntry.students.size;

                        // Score (Global Average for MK)
                        if (mkEntry.countNilai > 0) {
                            const avg = mkEntry.totalNilai / mkEntry.countNilai;
                            totalAvgScore += avg;
                            mkWithScores++;
                        }
                    }

                    // Denominator Calculation
                    // Base: Students in the Target Cohort (Prodi + Semester)
                    const targetProdi = mk?.prodiId;
                    const targetSem = mk?.semester;

                    let baseDenominator = 0;
                    if (targetProdi && targetSem) {
                        const key = `${targetProdi}-${targetSem}`;
                        baseDenominator = prodiSemCountMap.get(key) || 0;
                    }

                    // Adjustment: "Extra" students (Retakers / Out of Cohort)
                    // These are students present in 'numerator' but NOT in 'baseDenominator'
                    // We need to identify them. 
                    // To do this efficiently, we need to know the prodi/sem of every graded student.
                    // We need to update the fetching logic above to include these details.

                    // Let's assume we have `studentInfoMap` (id -> {prodi, sem}) mapping constructed from the grades query.
                    // We count how many graded students do NOT match (targetProdi, targetSem).

                    let extraCount = 0;
                    if (mkEntry && targetProdi && targetSem) {
                        mkEntry.details.forEach((student: any) => {
                            // Check if student matches cohort
                            const sProdi = student.prodiId;
                            const sSem = student.semester;

                            // If specific prodi filter is active in the request, we might need to respect it? 
                            // But usually MK semester is fixed.
                            // If student is NOT in standard cohort, add to denominator
                            if (sProdi !== targetProdi || sSem !== targetSem) {
                                extraCount++;
                            }
                        });
                    }

                    denominator = baseDenominator + extraCount;
                }

                totalStudentsGraded += numerator;
                totalStudentsExpected += denominator;
            }

            const finalAvg = mkWithScores > 0 ? totalAvgScore / mkWithScores : 0;

            const progressInput = totalStudentsExpected > 0
                ? parseFloat(((totalStudentsGraded / totalStudentsExpected) * 100).toFixed(1))
                : 0;

            // Cap at 100% strictly if logical error persists, but the fix above should solve it naturally.
            // const cappedProgress = Math.min(progressInput, 100); 

            return {
                id: dosen.id,
                nama: dosen.profile?.namaLengkap || dosen.email,
                totalKelas: pengampu.length,
                avgNilai: parseFloat(finalAvg.toFixed(2)),
                progressInput: progressInput // Should be correct now
            };
        });
    }

    static async getStudentEvaluation(params: { prodiId?: string, angkatan?: string, semester?: string, fakultasId?: string }) {
        const { prodiId, angkatan, semester, fakultasId } = params;
        const where: any = { role: { role: { name: 'mahasiswa' } } };
        const profileWhere: any = {};

        if (prodiId && prodiId !== 'all') profileWhere.prodiId = prodiId;
        if (fakultasId && fakultasId !== 'all') {
            profileWhere.OR = [
                { fakultasId: fakultasId },
                { prodi: { fakultasId: fakultasId } }
            ];
        }
        if (semester) profileWhere.semester = parseInt(semester);
        if (angkatan) profileWhere.angkatanRef = { tahun: parseInt(angkatan) };

        where.profile = profileWhere;

        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        namaLengkap: true,
                        nim: true
                    }
                }
            },
            take: 100
        });

        const studentIds = students.map(s => s.id);
        if (studentIds.length === 0) return [];

        const allScores = await prisma.nilaiCpl.groupBy({
            by: ['mahasiswaId', 'cplId'],
            where: { mahasiswaId: { in: studentIds } },
            _avg: { nilai: true }
        });

        const studentScoreMap = new Map<string, Array<{ cplId: string, avg: number }>>();

        allScores.forEach(s => {
            if (!s.mahasiswaId) return;
            const entry = studentScoreMap.get(s.mahasiswaId) || [];
            const val = s._avg.nilai ? Number(s._avg.nilai) : 0;
            entry.push({ cplId: s.cplId, avg: val });
            studentScoreMap.set(s.mahasiswaId, entry);
        });

        // Pre-fetch CPL codes for mapping - MOVED OUTSIDE MAP
        const cplList = await prisma.cpl.findMany({ select: { id: true, kodeCpl: true } });
        const cplMap = new Map(cplList.map(c => [c.id, c.kodeCpl]));

        const evaluation = students.map((mhs) => {
            const scores = studentScoreMap.get(mhs.id) || [];

            const avgScore = scores.length > 0
                ? scores.reduce((acc, curr) => acc + curr.avg, 0) / scores.length
                : 0;

            const lowCplCount = scores.filter(s => s.avg < 55).length;

            return {
                id: mhs.id,
                nama: mhs.profile?.namaLengkap || mhs.email,
                nim: mhs.profile?.nim || '-',
                avgCpl: parseFloat(avgScore.toFixed(2)),
                lowCplCount,
                lowCplDetails: scores
                    .filter(s => s.avg < 55)
                    .map(s => ({
                        kodeCpl: cplMap.get(s.cplId) || 'Unknown',
                        nilai: parseFloat(s.avg.toFixed(2))
                    }))
            };
        });

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
