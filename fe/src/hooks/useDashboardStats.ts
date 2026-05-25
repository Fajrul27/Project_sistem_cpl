import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardStats, fetchTranskripCPL, fetchDosenAnalysis, fetchStudentEvaluation, api } from "@/lib/api";
import { toast } from "sonner";
import { signalDashboardMutation, getLastMutationTime } from "@/lib/dashboardMutationSignal";

// ─── Cache Constants ──────────────────────────────────────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (match server TTL)
const SESSION_CACHE_KEY_PREFIX = "dashboard_cache_";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildFilterKey(role: string, filters: any): string {
    const sorted = Object.keys(filters)
        .sort()
        .map(k => `${k}=${filters[k] ?? ""}`)
        .join("&");
    return `${SESSION_CACHE_KEY_PREFIX}${role}:${sorted}`;
}

function readCache(key: string): any | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const entry: { data: any; expiresAt: number; mutationTimeAtWrite: number } = JSON.parse(raw);
        if (Date.now() > entry.expiresAt) {
            sessionStorage.removeItem(key);
            return null;
        }
        // Stale if a mutation happened AFTER this cache entry was written
        if (getLastMutationTime() > entry.mutationTimeAtWrite) {
            sessionStorage.removeItem(key);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

function writeCache(key: string, data: any): void {
    try {
        sessionStorage.setItem(key, JSON.stringify({
            data,
            expiresAt: Date.now() + CACHE_TTL_MS,
            mutationTimeAtWrite: getLastMutationTime(),
        }));
    } catch {
        // sessionStorage full or unavailable – silently skip
    }
}

/** Remove all dashboard cache entries (e.g. after data mutation) */
export function clearDashboardSessionCache(): void {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(SESSION_CACHE_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach(k => sessionStorage.removeItem(k));
}

/** Re-export for convenience — call this after any successful data mutation */
export { signalDashboardMutation } from \"@/lib/dashboardMutationSignal\";

// ─── Hook ─────────────────────────────────────────────────────────────────────
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

    // Track last fetched filter key so we skip duplicate fetches (e.g. navigate back)
    const lastFetchedKeyRef = useRef<string | null>(null);

    // ─── Apply fetched data to state ──────────────────────────────────────────
    const applyAdminData = useCallback((data: any, dosenData?: any[], studentData?: any[]) => {
        if (data?.stats) {
            setCplStats({
                total: data.stats.cpl || 0,
                avgScore: data.stats.avgScore || 0,
                totalCurriculum: 0,
                tercapai: 0,
            });
            setMkStats({ total: data.stats.mataKuliah || 0 });
            setStudentStats({ total: data.stats.users || 0 });
        }
        setChartData(data?.chartData || []);
        setTrendData(data?.trendData || []);
        setDistributionData(data?.distributionData || []);
        setPerformanceData(data?.performanceData || []);
        setAlerts(data?.alerts || []);
        setInsights(data?.insights || []);
        setCompleteness(data?.completeness || null);
        if (dosenData) setDosenAnalysis(dosenData);
        if (studentData) setStudentEvaluation(studentData);
    }, []);

    const applyStudentData = useCallback((data: any) => {
        if (!data) return;
        if (data.mahasiswa) setStudentInfo(data.mahasiswa);
        if (data.summary) {
            setCplStats({
                total: data.summary.totalCpl || 0,
                avgScore: data.summary.avgScore || 0,
                totalCurriculum: data.summary.totalCurriculumCpl || 0,
                tercapai: data.summary.tercapai || 0,
            });
            setMkStats({ total: data.summary.totalMataKuliah || 0 });
            setStudentStats({ total: 1 });
            setRecentAssessments(data.penilaianTeknikList || []);

            if (data.profilLulusan) {
                setProfilLulusanData(data.profilLulusan.map((pl: any) => ({
                    name: pl.nama,
                    kode: pl.kode,
                    nilai: pl.percentage,
                    full: 100,
                })));
            }

            if (data.transkrip) {
                const cplChartData = data.transkrip.map((t: any) => ({
                    name: t.cpl.kodeCpl,
                    nilai: t.nilaiAkhir,
                }));
                setChartData(cplChartData);
                setPerformanceData(
                    [...cplChartData]
                        .sort((a: any, b: any) => b.nilai - a.nilai)
                        .slice(0, 5)
                        .map((item: any) => ({
                            ...item,
                            status: item.nilai >= 80 ? "Sangat Baik" : item.nilai >= 70 ? "Baik" : "Perlu Peningkatan",
                        }))
                );

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
                setDistributionData(
                    dist.map(d => ({
                        ...d,
                        percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0",
                    })).filter(d => d.value > 0)
                );
            }
        }
    }, []);

    // ─── Fetch: Mahasiswa ─────────────────────────────────────────────────────
    const fetchStudentDashboardData = useCallback(async (forceRefresh = false) => {
        const targetId = user?.userId || user?.id;
        if (!targetId) return;

        const cacheKey = buildFilterKey("mahasiswa", { userId: targetId });

        // Serve from cache if available and not forced
        if (!forceRefresh) {
            const cached = readCache(cacheKey);
            if (cached && lastFetchedKeyRef.current === cacheKey) {
                // Same key, already loaded — skip entirely (e.g. navigate back)
                setLoading(false);
                return;
            }
            if (cached) {
                applyStudentData(cached);
                lastFetchedKeyRef.current = cacheKey;
                setLoading(false);
                return;
            }
        }

        try {
            const response = await fetchTranskripCPL(targetId);
            const data = response.data;
            if (data) {
                writeCache(cacheKey, data);
                applyStudentData(data);
                lastFetchedKeyRef.current = cacheKey;
            }
        } catch (error) {
            console.error("Error fetching student dashboard:", error);
            toast.error("Gagal memuat data dashboard mahasiswa");
        } finally {
            setLoading(false);
        }
    }, [user, applyStudentData]);

    // ─── Fetch: Admin / Dosen / Kaprodi ──────────────────────────────────────
    const fetchAdminDashboardData = useCallback(async (forceRefresh = false) => {
        const normalizedRole = role?.toLowerCase();
        if (!normalizedRole || normalizedRole === "mahasiswa") return;

        const cacheKey = buildFilterKey(normalizedRole, activeFilters);

        // Serve from cache if available and not forced
        if (!forceRefresh) {
            const cached = readCache(cacheKey);
            if (cached && lastFetchedKeyRef.current === cacheKey) {
                // Same key already loaded — skip (navigate back case)
                setLoading(false);
                return;
            }
            if (cached) {
                applyAdminData(cached.stats, cached.dosen, cached.students);
                lastFetchedKeyRef.current = cacheKey;
                setLoading(false);
                return;
            }
        }

        try {
            const isManager = normalizedRole === "admin" || normalizedRole === "kaprodi";

            let statsRes, dosenRes, studentRes;
            if (isManager) {
                [statsRes, dosenRes, studentRes] = await Promise.all([
                    fetchDashboardStats(activeFilters),
                    fetchDosenAnalysis(activeFilters).catch(() => ({ data: [] })),
                    fetchStudentEvaluation(activeFilters).catch(() => ({ data: [] })),
                ]);
            } else {
                statsRes = await fetchDashboardStats(activeFilters);
            }

            const data = statsRes?.data;
            const dosenData = dosenRes?.data;
            const studentData = studentRes?.data;

            if (data) {
                writeCache(cacheKey, { stats: data, dosen: dosenData, students: studentData });
                applyAdminData(data, dosenData, studentData);
                lastFetchedKeyRef.current = cacheKey;
            }
        } catch (error: any) {
            if (error.message?.includes("403") || error.message?.toLowerCase().includes("forbidden")) {
                console.warn("Dashboard permissions restricted for role:", normalizedRole);
                return;
            }
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, [role, activeFilters, applyAdminData]);

    // ─── Invalidate cache + re-fetch (call after data mutations) ─────────────
    const invalidateAndRefresh = useCallback(async () => {
        // Tell server to bump its cache version
        try {
            await api.post("/dashboard/invalidate-cache", {}, {});
        } catch {
            // Best-effort — server cache will expire on its own TTL
        }
        // Clear sessionStorage cache
        clearDashboardSessionCache();
        lastFetchedKeyRef.current = null;

        // Re-fetch fresh data
        setLoading(true);
        if (role?.toLowerCase() === "mahasiswa") {
            await fetchStudentDashboardData(true);
        } else {
            await fetchAdminDashboardData(true);
        }
    }, [role, fetchStudentDashboardData, fetchAdminDashboardData]);

    // ─── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const targetId = user?.userId || user?.id;
        if (role === "mahasiswa" && targetId) {
            setLoading(true);
            fetchStudentDashboardData();
        }
    }, [role, user?.userId, user?.id, fetchStudentDashboardData]);

    useEffect(() => {
        if (role && role !== "mahasiswa") {
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
        /** Force re-fetch (use after mutating data in other pages) */
        refresh: role?.toLowerCase() === "mahasiswa" ? fetchStudentDashboardData : fetchAdminDashboardData,
        /** Invalidate both server & client cache then re-fetch fresh */
        invalidateAndRefresh,
    };
}
