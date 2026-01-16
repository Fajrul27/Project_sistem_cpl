import { useState, useEffect, useCallback } from "react";
import { api, fetchFakultasList, fetchProdiList } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { toast } from "sonner";

export interface KuesionerStat {
    cplId: string;
    kodeCpl: string;
    deskripsi: string;
    rataRata: number;
    jumlahResponden: number;
}

export function useRekapKuesioner() {
    const { role, profile } = useUserRole();
    const { can } = usePermission(); // Use permission context
    const [stats, setStats] = useState<KuesionerStat[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [tahunAjaran, setTahunAjaran] = useState<string>("");
    const [semester, setSemester] = useState<string>("all");
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");

    // Data Lists
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);

    const canViewAll = can('view_all', 'rekap_kuesioner') || role === 'admin';
    const canView = can('view', 'rekap_kuesioner');

    const fetchInitialData = useCallback(async () => {
        if (canViewAll) {
            try {
                const [fakultasRes, prodiRes] = await Promise.all([
                    fetchFakultasList(),
                    fetchProdiList()
                ]);
                setFakultasList(fakultasRes.data || []);
                setProdiList(prodiRes.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        }
    }, [canViewAll]);

    const fetchStats = useCallback(async () => {
        if (!canView) return; // Guard
        setLoading(true);
        try {
            const params: any = {
                tahunAjaranId: tahunAjaran
            };

            if (semester !== 'all') {
                params.semester = semester;
            }

            if (canViewAll) {
                if (selectedProdi !== 'all') params.prodiId = selectedProdi;
                if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            }
            // For others (Kaprodi/Dosen), backend handles prodiId enforcement automatically or based on profile

            const res = await api.get("/kuesioner/stats", { params });

            // Handle response format (direct array or object with data property)
            const statsData = Array.isArray(res) ? res : (res.data || []);
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Gagal memuat statistik kuesioner");
        } finally {
            setLoading(false);
        }
    }, [tahunAjaran, semester, selectedProdi, selectedFakultas, canView, canViewAll]);

    useEffect(() => {
        if (canViewAll) {
            fetchInitialData();
        }
    }, [canViewAll, fetchInitialData]);

    // Fetch Prodi when Fakultas changes (Admin/ViewAll only)
    useEffect(() => {
        if (canViewAll) {
            // Re-fetch prodi when fakultas changes logic
            const loadProdi = async () => {
                const fakultasId = selectedFakultas !== 'all' ? selectedFakultas : undefined;
                const res = await fetchProdiList(fakultasId);
                setProdiList(res.data || []);
                if (selectedProdi !== 'all') {
                    const exists = (res.data || []).find((p: any) => p.id === selectedProdi);
                    if (!exists) setSelectedProdi("all");
                }
            };
            loadProdi();
        }
    }, [selectedFakultas, canViewAll]); // Simplified dependency

    // Re-fetch stats when filters change or initially
    useEffect(() => {
        if (canView) {
            fetchStats();
        }
    }, [tahunAjaran, semester, selectedFakultas, selectedProdi, canView, fetchStats]);

    const resetFilters = () => {
        setSelectedFakultas("all");
        setSelectedProdi("all");
        setSemester("all");
        setTahunAjaran("");
    };

    const isFiltered = !(selectedFakultas === "all" && selectedProdi === "all" && semester === "all" && !tahunAjaran);

    return {
        role,
        profile,
        stats,
        loading,

        // Filter values
        tahunAjaran,
        semester,
        selectedFakultas,
        selectedProdi,

        // Filter lists
        fakultasList,
        prodiList,

        // Setters
        setTahunAjaran,
        setSemester,
        setSelectedFakultas,
        setSelectedProdi,
        resetFilters,
        isFiltered
    };
}
