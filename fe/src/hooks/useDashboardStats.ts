import { useState, useEffect, useCallback } from "react";
// Hook for fetching dashboard statistics
import { fetchDashboardStats, fetchTranskripCPL, fetchDosenAnalysis, fetchStudentEvaluation } from "@/lib/api";
import { toast } from "sonner";

export function useDashboardStats(role: string | null, user: any, activeFilters: any = {}) {
    const [loading, setLoading] = useState(true);

    // Stats State
    const [cplStats, setCplStats] = useState({ total: 0, avgScore: 0, totalCurriculum: 0, tercapai: 0 });
    const [mkStats, setMkStats] = useState({ total: 0 });
    const [studentStats, setStudentStats] = useState({ total: 0 });

    // Chart Data State
    const [chartData, setChartData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [profilLulusanData, setProfilLulusanData] = useState<any[]>([]);

    // New Features State
    const [alerts, setAlerts] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [completeness, setCompleteness] = useState<any>(null);
    const [dosenAnalysis, setDosenAnalysis] = useState<any[]>([]);
    const [studentEvaluation, setStudentEvaluation] = useState<any[]>([]);

    const fetchStudentDashboardData = useCallback(async () => {
        const targetId = user?.userId || user?.id;
        if (!targetId) return;

        try {
            const response = await fetchTranskripCPL(targetId);
            const data = response.data;

            if (data) {
                if (data.mahasiswa) {
                    setStudentInfo(data.mahasiswa);
                }

                if (data.summary) {
                    setCplStats({
                        total: data.summary.totalCpl || 0,
                        avgScore: data.summary.avgScore || 0,
                        totalCurriculum: data.summary.totalCurriculumCpl || 0,
                        tercapai: data.summary.tercapai || 0
                    });
                    setMkStats({ total: data.summary.totalMataKuliah || 0 });
                    setStudentStats({ total: 1 });

                    setRecentAssessments(data.penilaianTeknikList || []);

                    // Map Profil Lulusan Data
                    if (data.profilLulusan) {
                        const plData = data.profilLulusan.map((pl: any) => ({
                            name: pl.nama,
                            kode: pl.kode,
                            nilai: pl.percentage,
                            full: 100
                        }));
                        setProfilLulusanData(plData);
                    }

                    if (data.transkrip) {
                        const cplChartData = data.transkrip.map((t: any) => ({
                            name: t.cpl.kodeCpl,
                            nilai: t.nilaiAkhir
                        }));
                        setChartData(cplChartData);

                        const perfData = [...cplChartData]
                            .sort((a: any, b: any) => b.nilai - a.nilai)
                            .slice(0, 5)
                            .map((item: any) => ({
                                ...item,
                                status: item.nilai >= 80 ? "Excellent" : item.nilai >= 70 ? "Good" : "Need Improvement"
                            }));
                        setPerformanceData(perfData);

                        // Distribution Logic
                        const dist = [
                            { name: "Sangat Baik (>85)", value: 0 },
                            { name: "Baik (70-85)", value: 0 },
                            { name: "Cukup (60-70)", value: 0 },
                            { name: "Kurang (<60)", value: 0 },
                        ];

                        data.transkrip.forEach((t: any) => {
                            const n = t.nilaiAkhir;
                            if (n >= 85) dist[0].value++;
                            else if (n >= 70) dist[1].value++;
                            else if (n >= 60) dist[2].value++;
                            else dist[3].value++;
                        });

                        const total = data.transkrip.length;
                        const distData = dist.map(d => ({
                            ...d,
                            percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0"
                        })).filter(d => d.value > 0);

                        setDistributionData(distData);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching student dashboard:", error);
            toast.error("Gagal memuat data dashboard mahasiswa");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchAdminDashboardData = useCallback(async () => {
        // Prevent calling admin/dosen endpoints if user is mahasiswa
        const normalizedRole = role?.toLowerCase();
        if (!normalizedRole || normalizedRole === 'mahasiswa') return;

        try {
            // Stats call - only if it's not a student
            const statsRes = await fetchDashboardStats(activeFilters);
            const data = statsRes.data;

            if (data) {
                if (data.stats) {
                    setCplStats({
                        total: data.stats.cpl || 0,
                        avgScore: data.stats.avgScore || 0,
                        totalCurriculum: 0,
                        tercapai: 0
                    });
                    setMkStats({ total: data.stats.mataKuliah || 0 });
                    setStudentStats({ total: data.stats.users || 0 });
                }

                setChartData(data.chartData || []);
                setTrendData(data.trendData || []);
                setDistributionData(data.distributionData || []);
                setPerformanceData(data.performanceData || []);

                setAlerts(data.alerts || []);
                setInsights(data.insights || []);
                setCompleteness(data.completeness || null);
            }

            // Only fetch management data for admin or kaprodi roles
            const isManager = normalizedRole === 'admin' || normalizedRole === 'kaprodi';

            if (isManager) {
                const [dosenRes, studentRes] = await Promise.all([
                    fetchDosenAnalysis(activeFilters).catch(() => ({ data: [] })),
                    fetchStudentEvaluation(activeFilters).catch(() => ({ data: [] }))
                ]);

                if (dosenRes.data) setDosenAnalysis(dosenRes.data);
                if (studentRes.data) setStudentEvaluation(studentRes.data);
            }

        } catch (error: any) {
            // Ignore 403 errors in the background or log them silently to avoid user-facing toast spam
            if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
                console.warn("Dashboard permissions restricted for this role:", normalizedRole);
                return;
            }
            console.error("Error fetching dashboard data:", error);
            // toast.error("Gagal memuat data dashboard"); // Silent for background errors that might be expected for some roles
        } finally {
            setLoading(false);
        }
    }, [role, activeFilters]);

    // Student Data Fetch Effect
    useEffect(() => {
        const targetId = user?.userId || user?.id;
        if (role === 'mahasiswa' && targetId) {
            setLoading(true);
            fetchStudentDashboardData();
        }
    }, [role, user?.userId, user?.id, fetchStudentDashboardData]);

    // Admin/Staff Data Fetch Effect
    useEffect(() => {
        if (role && role !== 'mahasiswa') {
            setLoading(true);
            fetchAdminDashboardData();
        }
    }, [role, activeFilters, fetchAdminDashboardData]);

    return {
        loading,
        cplStats,
        mkStats,
        studentStats,
        chartData,
        trendData,
        distributionData,
        performanceData,
        recentAssessments,
        studentInfo,
        alerts,
        insights,
        completeness,
        dosenAnalysis,
        studentEvaluation,
        profilLulusanData,
        refresh: role?.toLowerCase() === 'mahasiswa' ? fetchStudentDashboardData : fetchAdminDashboardData
    };
}
