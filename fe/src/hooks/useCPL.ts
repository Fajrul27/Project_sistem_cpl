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
    const [kategoriFilter, setKategoriFilter] = useState<string>("all");
    const [prodiFilter, setProdiFilter] = useState<string>("all");

    // Data
    const [cplList, setCplList] = useState<CPL[]>([]);
    const [kategoriList, setKategoriList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProdi = useCallback(async () => {
        try {
            const result = await api.get('/prodi');
            if (result.data) setProdiList(result.data);
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, []);

    const fetchKategori = useCallback(async () => {
        try {
            const result = await api.get('/kategori-cpl');
            if (result.data) setKategoriList(result.data);
        } catch (error) {
            console.error("Error fetching kategori CPL:", error);
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

            if (kategoriFilter !== "all") params.kategori = kategoriFilter;
            if (prodiFilter !== "all") params.prodiId = prodiFilter;

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
    }, [page, searchTerm, kategoriFilter, prodiFilter]);

    useEffect(() => {
        fetchCPL();
    }, [fetchCPL]);

    // Wrapper setters to reset page
    const handleSetSearchTerm = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    };

    const handleSetKategoriFilter = (val: string) => {
        setKategoriFilter(val);
        setPage(1);
    };

    const handleSetProdiFilter = (val: string) => {
        setProdiFilter(val);
        setPage(1);
    };

    const createCPL = async (payload: any) => {
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
    };

    const updateCPL = async (id: string, payload: any) => {
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
    };

    const deleteCPL = async (id: string) => {
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
    };

    // Generic reset
    const resetFilters = () => {
        setKategoriFilter("all");
        setProdiFilter("all");
        setSearchTerm("");
        setPage(1);
    };

    return {
        // Data
        cplList,
        fullCplList: cplList, // Keeping legacy support if any
        kategoriList,
        prodiList,
        loading,

        // Actions
        fetchCPL,
        fetchKategori,
        fetchProdi,
        createCPL,
        updateCPL,
        deleteCPL,

        // Standardized Filters Object
        filters: {
            searchTerm,
            kategoriFilter,
            prodiFilter
        },

        // Individual Setters
        setSearchTerm: handleSetSearchTerm,
        setKategoriFilter: handleSetKategoriFilter,
        setProdiFilter: handleSetProdiFilter,
        resetFilters,

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
