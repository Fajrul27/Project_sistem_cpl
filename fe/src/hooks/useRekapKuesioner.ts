import { useState, useEffect, useCallback } from "react";
import { api, fetchFakultasList, fetchProdiList } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
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
    const [stats, setStats] = useState<KuesionerStat[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [tahunAjaran, setTahunAjaran] = useState("2024/2025 Ganjil");
    const [semester, setSemester] = useState<string>("all");
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");

    // Data Lists
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);

    const fetchInitialData = useCallback(async () => {
        if (role === 'admin') {
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
    }, [role]);

    const fetchProdi = useCallback(async () => {
        try {
            const fakultasId = selectedFakultas !== 'all' ? selectedFakultas : undefined;
            const res = await fetchProdiList(fakultasId);
            setProdiList(res.data || []);

            // Reset selected Prodi if not in new list
            if (selectedProdi !== 'all') {
                const exists = (res.data || []).find((p: any) => p.id === selectedProdi);
                if (!exists) setSelectedProdi("all");
            }
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, [selectedFakultas, selectedProdi]);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                tahunAjaran
            };

            if (semester !== 'all') {
                params.semester = semester;
            }

            if (role === 'admin') {
                if (selectedProdi !== 'all') params.prodiId = selectedProdi;
                if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            }
            // For Kaprodi, backend handles prodiId enforcement automatically

            const res = await api.get("/kuesioner/stats", { params });

            // Handle response format (direct array or object with data property)
            const statsData = Array.isArray(res) ? res : (res.data || []);
            // console.log("Fetched Kuesioner Stats:", statsData.length, "items", statsData);
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Gagal memuat statistik kuesioner");
        } finally {
            setLoading(false);
        }
    }, [tahunAjaran, semester, selectedProdi, selectedFakultas, role]);

    useEffect(() => {
        if (role === "kaprodi" || role === "admin") {
            fetchInitialData();
        }
    }, [role, fetchInitialData]);

    // Fetch Prodi when Fakultas changes (Admin only)
    useEffect(() => {
        if (role === 'admin') {
            fetchProdi();
        }
    }, [selectedFakultas, role, fetchProdi]);

    // DEBUG: Check if ANY data exists
    useEffect(() => {
        if (role === 'admin') {
            api.get("/kuesioner/stats").then(res => {
                const data = Array.isArray(res) ? res : (res.data || []);
                // console.log("DEBUG: All Stats (No Filter):", data.length, "items");
            }).catch(e => console.error("DEBUG FETCH ERROR:", e));
        }
    }, [role]);

    // Re-fetch stats when filters change or initially
    useEffect(() => {
        if (role === "kaprodi" || role === "admin") {
            fetchStats();
        }
    }, [tahunAjaran, semester, selectedFakultas, selectedProdi, role, fetchStats]);

    const resetFilters = () => {
        setSelectedFakultas("all");
        setSelectedProdi("all");
        setSemester("all");
        setTahunAjaran("2024/2025 Ganjil");
    };

    const isFiltered = !(selectedFakultas === "all" && selectedProdi === "all" && semester === "all" && tahunAjaran === "2024/2025 Ganjil");

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
