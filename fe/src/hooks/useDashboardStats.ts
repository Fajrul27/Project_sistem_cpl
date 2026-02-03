import { useState, useEffect, useCallback } from "react";
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

    // New Features State
    const [alerts, setAlerts] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [completeness, setCompleteness] = useState<any>(null);
    const [dosenAnalysis, setDosenAnalysis] = useState<any[]>([]);
    const [studentEvaluation, setStudentEvaluation] = useState<any[]>([]);

    const fetchStudentDashboardData = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await fetchTranskripCPL(user.id);
            const data = response.data;

            if (data && data.summary) {
                setCplStats({
                    total: data.summary.totalCpl || 0,
                    avgScore: data.summary.avgScore || 0,
                    totalCurriculum: data.summary.totalCurriculumCpl || 0,
                    tercapai: data.summary.tercapai || 0
                });
                setMkStats({ total: data.transkrip?.length || 0 });
                setStudentStats({ total: 1 });

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
        } catch (error) {
            console.error("Error fetching student dashboard:", error);
            toast.error("Gagal memuat data dashboard mahasiswa");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchAdminDashboardData = useCallback(async () => {
        try {
            // BEFORE OPTIMIZATION: Sequential API calls (slower)
            const statsRes = await fetchDashboardStats(activeFilters);
            const dosenRes = (role === 'admin' || role === 'kaprodi') ? await fetchDosenAnalysis(activeFilters.prodiId) : { data: [] };
            const studentRes = (role === 'admin' || role === 'kaprodi') ? await fetchStudentEvaluation(activeFilters) : { data: [] };

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

            if (dosenRes.data) setDosenAnalysis(dosenRes.data);
            if (studentRes.data) setStudentEvaluation(studentRes.data);

        } catch (error: any) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Gagal memuat data dashboard");
        } finally {
            setLoading(false);
        }
    }, [role, activeFilters]);

    useEffect(() => {
        if (role) {
            setLoading(true);
            if (role === 'mahasiswa') {
                fetchStudentDashboardData();
            } else {
                fetchAdminDashboardData();
            }
        }
    }, [role, user, activeFilters, fetchStudentDashboardData, fetchAdminDashboardData]);

    return {
        loading,
        cplStats,
        mkStats,
        studentStats,
        chartData,
        trendData,
        distributionData,
        performanceData,
        alerts,
        insights,
        completeness,
        dosenAnalysis,
        studentEvaluation,
        refresh: role === 'mahasiswa' ? fetchStudentDashboardData : fetchAdminDashboardData
    };
}
