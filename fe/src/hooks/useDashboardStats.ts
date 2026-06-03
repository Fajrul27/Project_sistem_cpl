import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardStats, fetchTranskripCPL, fetchDosenAnalysis, fetchStudentEvaluation, api } from "@/lib/api";
import { toast } from "sonner";

// ─── Cache Constants ──────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes max age
const SESSION_CACHE_KEY_PREFIX = "dashboard_cache_";
const SERVER_VERSION_KEY = "dashboard_server_version";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildFilterKey(role: string, filters: any): string {
    const sorted = Object.keys(filters)
        .sort()
        .map(k => `${k}=${filters[k] ?? ""}`)
        .join("&");
    return `${SESSION_CACHE_KEY_PREFIX}${role}:${sorted}`;
}

/**
 * Read cached data.
 * Returns null if:
 *   - No cache exists
 *   - Cache is expired (> TTL)
 *   - Server version stored in cache doesn't match current known server version
 */
function readCache(key: string): any | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const entry: { data: any; expiresAt: number; serverVersion: number } = JSON.parse(raw);
        if (Date.now() > entry.expiresAt) {
            sessionStorage.removeItem(key);
            return null;
        }
        // Compare against the last-known server version
        const knownVersion = getKnownServerVersion();
        if (knownVersion !== null && entry.serverVersion !== knownVersion) {
            sessionStorage.removeItem(key);
            return null;
        }
        return entry.data;
    } catch {
        return null;
    }
}

function writeCache(key: string, data: any, serverVersion: number): void {
    try {
        sessionStorage.setItem(key, JSON.stringify({
            data,
            expiresAt: Date.now() + CACHE_TTL_MS,
            serverVersion,
        }));
    } catch {
        // sessionStorage full or unavailable – silently skip
    }
}

function getKnownServerVersion(): number | null {
    const v = sessionStorage.getItem(SERVER_VERSION_KEY);
    return v !== null ? parseInt(v, 10) : null;
}

function setKnownServerVersion(version: number): void {
    sessionStorage.setItem(SERVER_VERSION_KEY, String(version));
}

/** Remove all dashboard cache entries */
export function clearDashboardSessionCache(): void {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(SESSION_CACHE_KEY_PREFIX)) keys.push(key);
    }
    keys.forEach(k => sessionStorage.removeItem(k));
    sessionStorage.removeItem(SERVER_VERSION_KEY);
}

/**
 * Fetch current server cache version (very lightweight ~50ms).
 * Returns null if request fails (offline / not authed) — caller handles gracefully.
 */
async function fetchServerVersion(): Promise<number | null> {
    try {
        const res = await api.get("/dashboard/data-version");
        const v = res?.version ?? res?.data?.version;
        return typeof v === "number" ? v : null;
    } catch {
        return null;
    }
}

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

    // Prevent concurrent fetches for the same key
    const fetchingKeyRef = useRef<string | null>(null);

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

    // ─── Core fetch logic with server-version check ───────────────────────────
    /**
     * 1. Fetch /dashboard/data-version (fast, ~50ms)
     * 2. Compare with version stored in cache
     *    - Same version → use cached data instantly
     *    - Different version (or no cache) → fetch full stats from server
     * 3. forceRefresh=true bypasses cache entirely
     */
    const fetchAdminDashboardData = useCallback(async (forceRefresh = false) => {
        const normalizedRole = role?.toLowerCase();
        if (!normalizedRole || normalizedRole === "mahasiswa") return;

        const cacheKey = buildFilterKey(normalizedRole, activeFilters);

        // Prevent concurrent fetches for same key
        if (fetchingKeyRef.current === cacheKey && !forceRefresh) return;
        fetchingKeyRef.current = cacheKey;

        try {
            if (!forceRefresh) {
                // Step 1: Quick version check from server
                const serverVersion = await fetchServerVersion();

                if (serverVersion !== null) {
                    // Update the known version
                    setKnownServerVersion(serverVersion);

                    // Step 2: Check cache (readCache will compare versions internally)
                    const cached = readCache(cacheKey);
                    if (cached) {
                        // Cache is fresh and version matches — use it instantly
                        applyAdminData(cached.stats, cached.dosen, cached.students);
                        setLoading(false);
                        fetchingKeyRef.current = null;
                        return;
                    }
                    // Version mismatch or no cache — fall through to full fetch
                }
                // If version fetch failed (offline), try using cache as fallback
                else {
                    const cached = readCache(cacheKey);
                    if (cached) {
                        applyAdminData(cached.stats, cached.dosen, cached.students);
                        setLoading(false);
                        fetchingKeyRef.current = null;
                        return;
                    }
                }
            }

            // Step 3: Fetch full data from server
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
                // Fetch version again after full load to write accurate version to cache
                const newVersion = await fetchServerVersion() ?? getKnownServerVersion() ?? 0;
                writeCache(cacheKey, { stats: data, dosen: dosenData, students: studentData }, newVersion);
                applyAdminData(data, dosenData, studentData);
            }
        } catch (error: any) {
            if (error.message?.includes("403") || error.message?.toLowerCase().includes("forbidden")) {
                console.warn("Dashboard permissions restricted for role:", normalizedRole);
                return;
            }
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
            fetchingKeyRef.current = null;
        }
    }, [role, activeFilters, applyAdminData]);

    // ─── Fetch: Mahasiswa ─────────────────────────────────────────────────────
    const fetchStudentDashboardData = useCallback(async (forceRefresh = false) => {
        const targetId = user?.userId || user?.id;
        if (!targetId) return;

        const cacheKey = buildFilterKey("mahasiswa", { userId: targetId });

        if (fetchingKeyRef.current === cacheKey && !forceRefresh) return;
        fetchingKeyRef.current = cacheKey;

        try {
            if (!forceRefresh) {
                const serverVersion = await fetchServerVersion();
                if (serverVersion !== null) {
                    setKnownServerVersion(serverVersion);
                    const cached = readCache(cacheKey);
                    if (cached) {
                        applyStudentData(cached);
                        setLoading(false);
                        fetchingKeyRef.current = null;
                        return;
                    }
                } else {
                    const cached = readCache(cacheKey);
                    if (cached) {
                        applyStudentData(cached);
                        setLoading(false);
                        fetchingKeyRef.current = null;
                        return;
                    }
                }
            }

            const response = await fetchTranskripCPL(targetId);
            const data = response.data;
            if (data) {
                const newVersion = await fetchServerVersion() ?? getKnownServerVersion() ?? 0;
                writeCache(cacheKey, data, newVersion);
                applyStudentData(data);
            }
        } catch (error) {
            console.error("Error fetching student dashboard:", error);
            toast.error("Gagal memuat data dashboard mahasiswa");
        } finally {
            setLoading(false);
            fetchingKeyRef.current = null;
        }
    }, [user, applyStudentData]);

    // ─── Invalidate cache + re-fetch ─────────────────────────────────────────
    const invalidateAndRefresh = useCallback(async () => {
        clearDashboardSessionCache();
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
