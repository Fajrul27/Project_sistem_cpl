import { useState, useEffect, useCallback, useRef } from "react";
import { api, fetchFakultasList, fetchProdiList, fetchMataKuliahPengampu, getUser } from "@/lib/api";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export interface CPMK {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    levelTaksonomiRef?: {
        kode: string;
        deskripsi: string;
    };
    statusValidasi: 'draft' | 'validated' | 'active';
    validatedAt: string | null;
    createdAt: string;
    mataKuliah: {
        id: string;
        kodeMk: string;
        namaMk: string;
        semester: number;
    };
    creator?: {
        profile?: {
            namaLengkap: string;
        };
    };
}

export function useValidasiCPMK() {
    const { role } = useUserRole();
    const canValidate = role === "admin" || role === "kaprodi";

    const [cpmkList, setCpmkList] = useState<CPMK[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    // Filters Data
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Filter States
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");
    const [selectedMataKuliah, setSelectedMataKuliah] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const fetchInitialData = useCallback(async () => {
        try {
            const [fakultasRes, prodiRes] = await Promise.all([
                fetchFakultasList(),
                fetchProdiList()
            ]);
            setFakultasList(fakultasRes.data || []);
            setProdiList(prodiRes.data || []);

            const user = getUser();
            if (user && user.role === 'dosen') {
                const mkRes = await fetchMataKuliahPengampu(user.id);
                setMataKuliahList(mkRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, []);

    const fetchProdi = useCallback(async () => {
        try {
            const fakultasId = selectedFakultas !== 'all' ? selectedFakultas : undefined;
            const res = await fetchProdiList(fakultasId);
            setProdiList(res.data || []);
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, [selectedFakultas]);

    // Track first load
    const hasLoadedRef = useRef(false);

    const fetchCPMK = useCallback(async () => {
        try {
            if (!hasLoadedRef.current) setLoading(true);
            const params: any = {
                page,
                limit,
                q: searchTerm
            };

            if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (selectedMataKuliah !== 'all') params.mataKuliahId = selectedMataKuliah;
            if (selectedSemester !== 'all') params.semester = selectedSemester;
            if (filterStatus !== 'all') params.statusValidasi = filterStatus;

            const result = await api.get('/cpmk', { params });
            const data = result.data?.data || result.data || [];
            const meta = result.data?.meta || result.meta || { totalPages: 1, total: 0 };

            setCpmkList(Array.isArray(data) ? data : []);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);
        } catch (error) {
            console.error("Error fetching CPMK:", error);
            toast.error("Gagal memuat data CPMK");
            setCpmkList([]);
        } finally {
            setLoading(false);
            hasLoadedRef.current = true;
        }
    }, [page, searchTerm, selectedFakultas, selectedProdi, selectedMataKuliah, selectedSemester, filterStatus]);

    const handleValidate = async (cpmkId: string, newStatus: 'draft' | 'validated' | 'active') => {
        try {
            setUpdating(cpmkId);
            await api.put(`/cpmk/${cpmkId}/validate`, { statusValidasi: newStatus });

            toast.success(`Status berhasil diubah menjadi ${newStatus}`);

            // Optimistic update to avoid full reload
            setCpmkList(prev => prev.map(item =>
                item.id === cpmkId ? { ...item, statusValidasi: newStatus } : item
            ));
        } catch (error) {
            console.error('Error updating validation:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal mengubah status validasi');
        } finally {
            setUpdating(null);
        }
    };

    const resetFilters = () => {
        setSelectedFakultas("all");
        setSelectedProdi("all");
        setSelectedSemester("all");
        setSelectedMataKuliah("all");
        setFilterStatus("all");
        setSearchTerm("");
        setPage(1);
    };

    // Pagination Reset Helpers
    const handleSetSearchTerm = (val: string) => { setSearchTerm(val); setPage(1); };
    const handleSetSelectedFakultas = (val: string) => { setSelectedFakultas(val); setPage(1); };
    const handleSetSelectedProdi = (val: string) => { setSelectedProdi(val); setPage(1); };
    const handleSetSelectedMataKuliah = (val: string) => { setSelectedMataKuliah(val); setPage(1); };
    const handleSetSelectedSemester = (val: string) => { setSelectedSemester(val); setPage(1); };
    const handleSetFilterStatus = (val: string) => { setFilterStatus(val); setPage(1); };

    return {
        // Data
        cpmkList,
        loading,
        updating,
        fakultasList,
        prodiList,
        mataKuliahList,
        canValidate,
        role,

        // Standardized Filters Object
        filters: {
            filterStatus,
            selectedFakultas,
            selectedProdi,
            selectedMataKuliah,
            selectedSemester,
            searchTerm
        },

        // Individual Setters (Wrapped)
        setFilterStatus: handleSetFilterStatus,
        setSelectedFakultas: handleSetSelectedFakultas,
        setSelectedProdi: handleSetSelectedProdi,
        setSelectedMataKuliah: handleSetSelectedMataKuliah,
        setSelectedSemester: handleSetSelectedSemester,
        setSearchTerm: handleSetSearchTerm,
        resetFilters,

        // Actions
        fetchInitialData,
        fetchProdi,
        fetchCPMK,
        handleValidate,

        // Standardized Pagination Object
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        }
    };
}
