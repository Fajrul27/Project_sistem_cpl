import { useState, useCallback, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { CPL as CPLSchema } from "@schemas/index";

export interface CPL {
    id: string;
    kodeCpl: string;
    deskripsi: string;
    kategori: string;
    kategoriId?: string;
    kategoriRef?: { id: string; nama: string };
    prodiId?: string;
    prodi?: { id: string; nama: string; kode?: string };
    kurikulumId?: string;
    kurikulum?: { id: string; nama: string };
    createdAt?: string;
    updatedAt?: string;
}

export function useCPL() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Filter Stats
    const [searchTerm, setSearchTerm] = useState("");
    const [fakultasFilter, setFakultasFilter] = useState<string>("");
    const [prodiFilter, setProdiFilter] = useState<string>("all");
    const [kategoriFilter, setKategoriFilter] = useState<string>("all");
    const [kurikulumFilter, setKurikulumFilter] = useState<string>("all");

    // Data
    const [cplList, setCplList] = useState<CPL[]>([]);
    const [kategoriList, setKategoriList] = useState<any[]>([]);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [kurikulumList, setKurikulumList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFakultas = useCallback(async () => {
        try {
            const result = await api.get('/references/fakultas');
            if (result.data) setFakultasList(result.data);
        } catch (error) {
            console.error("Error fetching fakultas:", error);
        }
    }, []);

    const fetchProdi = useCallback(async () => {
        try {
            const url = fakultasFilter ? `/prodi?fakultasId=${fakultasFilter}` : '/prodi';
            const result = await api.get(url);
            if (result.data) setProdiList(result.data);
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, [fakultasFilter]);

    const fetchKategori = useCallback(async () => {
        try {
            const result = await api.get('/kategori-cpl');
            if (result.data) setKategoriList(result.data);
        } catch (error) {
            console.error("Error fetching kategori CPL:", error);
        }
    }, []);

    const fetchKurikulum = useCallback(async () => {
        try {
            const result = await api.get('/kurikulum');
            if (result.data) setKurikulumList(result.data);
        } catch (error) {
            console.error("Error fetching kurikulum:", error);
        }
    }, []);

    const fetchCPL = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                limit,
                q: searchTerm
            };

            if (prodiFilter !== "all") params.prodiId = prodiFilter;
            if (kategoriFilter !== "all") params.kategori = kategoriFilter;
            if (kurikulumFilter !== "all") params.kurikulumId = kurikulumFilter;

            const response = await api.get('/cpl', { params });

            // Handle { data, meta } response first
            if (response.data && response.meta) {
                setCplList(response.data);
                setTotalItems(response.meta.total);
                setTotalPages(response.meta.totalPages);
            }
            // Handle legacy array response
            else if (Array.isArray(response.data)) {
                setCplList(response.data);
                setTotalItems(response.data.length);
                setTotalPages(1);
            } else if (response.data?.data) {
                // Handle nested data structure if any
                setCplList(response.data.data);
                if (response.data.meta) {
                    setTotalItems(response.data.meta.total);
                    setTotalPages(response.data.meta.totalPages);
                }
            }

        } catch (error) {
            console.error('Error fetching CPL:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data CPL');
            setCplList([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, prodiFilter, kategoriFilter, kurikulumFilter]);

    // Initial Data Fetch
    useEffect(() => {
        fetchKategori();
        fetchFakultas();
        fetchKurikulum();
    }, [fetchKategori, fetchFakultas, fetchKurikulum]);

    // Data Fetch on Filter Change
    useEffect(() => {
        fetchCPL();
    }, [page, searchTerm, prodiFilter, kategoriFilter, kurikulumFilter]); // Use primitives to guarantee stability

    // Fetch prodi when fakultas filter changes
    useEffect(() => {
        fetchProdi();
    }, [fetchProdi]);

    // Wrapper setters to reset page
    const handleSetSearchTerm = useCallback((val: string) => {
        setSearchTerm(val);
        setPage(1);
    }, []);

    const handleSetFakultasFilter = useCallback((val: string) => {
        setFakultasFilter(val);
        setProdiFilter("all"); // Reset prodi when fakultas changes
        setPage(1);
    }, []);

    const handleSetProdiFilter = useCallback((val: string) => {
        setProdiFilter(val);
        setPage(1);
    }, []);

    const handleSetKategoriFilter = useCallback((val: string) => {
        setKategoriFilter(val);
        setPage(1);
    }, []);

    const handleSetKurikulumFilter = useCallback((val: string) => {
        setKurikulumFilter(val);
        setPage(1);
    }, []);

    const createCPL = useCallback(async (payload: any) => {
        try {
            await api.post('/cpl', payload);
            toast.success("CPL berhasil ditambahkan");
            await fetchCPL();
            return true;
        } catch (error) {
            console.error('Error saving CPL:', error);
            toast.error("Gagal menyimpan CPL");
            return false;
        }
    }, [fetchCPL]);

    const updateCPL = useCallback(async (id: string, payload: any) => {
        try {
            await api.put(`/cpl/${id}`, payload);
            toast.success("CPL berhasil diperbarui");
            await fetchCPL();
            return true;
        } catch (error) {
            console.error('Error saving CPL:', error);
            toast.error("Gagal menyimpan CPL");
            return false;
        }
    }, [fetchCPL]);

    const deleteCPL = useCallback(async (id: string) => {
        try {
            await api.delete(`/cpl/${id}`);
            toast.success("CPL berhasil dihapus");
            await fetchCPL();
            return true;
        } catch (error) {
            console.error('Error deleting CPL:', error);
            toast.error("Gagal menghapus CPL");
            return false;
        }
    }, [fetchCPL]);

    // Generic reset
    const resetFilters = useCallback(() => {
        setFakultasFilter("");
        setProdiFilter("all");
        setKategoriFilter("all");
        setKurikulumFilter("all");
        setSearchTerm("");
        setPage(1);
    }, []);

    const filters = useMemo(() => ({
        searchTerm,
        fakultasFilter,
        prodiFilter,
        kategoriFilter,
        kurikulumFilter
    }), [searchTerm, fakultasFilter, prodiFilter, kategoriFilter, kurikulumFilter]);

    const pagination = useMemo(() => ({
        page,
        setPage,
        totalPages,
        totalItems,
        limit
    }), [page, totalPages, totalItems]);

    return useMemo(() => ({
        // Data
        cplList,
        fullCplList: cplList,
        kategoriList,
        fakultasList,
        prodiList,
        kurikulumList,
        loading,

        // Actions
        fetchCPL,
        fetchKategori,
        fetchFakultas,
        fetchProdi,
        fetchKurikulum,
        createCPL,
        updateCPL,
        deleteCPL,

        // Standardized Filters Object
        filters,

        // Individual Setters
        setSearchTerm: handleSetSearchTerm,
        setFakultasFilter: handleSetFakultasFilter,
        setProdiFilter: handleSetProdiFilter,
        setKategoriFilter: handleSetKategoriFilter,
        setKurikulumFilter: handleSetKurikulumFilter,
        resetFilters,

        // Standardized Pagination Object
        pagination
    }), [
        cplList,
        kategoriList,
        fakultasList,
        prodiList,
        kurikulumList,
        loading,
        fetchCPL,
        fetchKategori,
        fetchFakultas,
        fetchProdi,
        fetchKurikulum,
        createCPL,
        updateCPL,
        deleteCPL,
        filters,
        handleSetSearchTerm,
        handleSetFakultasFilter,
        handleSetProdiFilter,
        handleSetKategoriFilter,
        handleSetKurikulumFilter,
        resetFilters,
        pagination
    ]);
}
