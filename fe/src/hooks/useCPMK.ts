import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { api, fetchFakultasList, fetchProdiList, fetchMataKuliahPengampu, getUser } from "@/lib/api";
import { toast } from "sonner";
import type { CPMK as CPMKSchema } from "@schemas/index";

export interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    semester: number;
    prodiId?: string;
}


// Frontend display type with relations (API response)
export interface Cpmk {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    mataKuliahId: string;
    mataKuliah: MataKuliah;
    cplMappings: any[];
    teknikPenilaian: {
        id: string;
        _count: { nilaiTeknik: number };
    }[];
}

// Module-level cache
const cpmkCache: Record<string, { data: any[], meta: any }> = {};

export function useCPMK() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const [cpmkList, setCpmkList] = useState<Cpmk[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);

    // Filter Stats
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");
    const [mataKuliahFilter, setMataKuliahFilter] = useState<string>("all");

    const fetchInitialData = useCallback(async () => {
        try {
            const [fakultasRes, prodiRes] = await Promise.all([
                fetchFakultasList(),
                fetchProdiList()
            ]);
            setFakultasList(fakultasRes.data || []);
            setProdiList(prodiRes.data || []);

            // If user is dosen, fetch taught courses
            const user = getUser();
            if (user && user.role === 'dosen') {
                const mkRes = await fetchMataKuliahPengampu(user.id);
                setMataKuliahList(mkRes.data || []);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    }, []);

    const fetchProdi = useCallback(async (fakultasId?: string) => {
        try {
            const res = await fetchProdiList(fakultasId);
            setProdiList(res.data || []);
            return res.data || [];
        } catch (error) {
            console.error("Error fetching prodi:", error);
            return [];
        }
    }, []);

    const fetchMataKuliah = useCallback(async (prodiId?: string) => {
        // Skip if user is dosen (already fetched in initialData)
        const user = getUser();
        if (user && user.role === 'dosen') return;

        try {
            const params: any = {};
            if (prodiId && prodiId !== 'all') params.prodiId = prodiId;

            const result = await api.get('/mata-kuliah', { params });
            const data = result.data || result;
            setMataKuliahList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching mata kuliah:', error);
            toast.error('Gagal memuat data mata kuliah');
        }
    }, []);

    // Track first load to avoid spinner on pagination
    const hasLoadedRef = useRef(false);

    // Simplified fetchCpmk relying on state
    const fetchCpmk = useCallback(async (force = false) => {
        const cacheKey = `${page}-${limit}-${searchTerm}-${selectedFakultas}-${selectedProdi}-${mataKuliahFilter}`;

        if (!force && cpmkCache[cacheKey]) {
            const cached = cpmkCache[cacheKey];
            setCpmkList(cached.data);
            setTotalItems(cached.meta.total);
            setTotalPages(cached.meta.totalPages);
            setLoading(false);
            return;
        }

        try {
            // Only show full loading if we are actually fetching
            setLoading(true);

            const params: any = {
                page,
                limit,
                q: searchTerm
            };

            if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (mataKuliahFilter !== 'all') params.mataKuliahId = mataKuliahFilter;

            const result = await api.get('/cpmk', { params });

            let newData: any[] = [];
            let newTotal = 0;
            let newPages = 1;

            // Handle { data, meta } response first
            if (result.data && result.meta) {
                newData = result.data;
                newTotal = result.meta.total;
                newPages = result.meta.totalPages;
            } else if (Array.isArray(result.data)) {
                newData = result.data;
                newTotal = result.data.length;
            } else if (result.data?.data) {
                newData = result.data.data;
                if (result.data.meta) {
                    newTotal = result.data.meta.total;
                    newPages = result.data.meta.totalPages;
                }
            }

            setCpmkList(newData);
            setTotalItems(newTotal);
            setTotalPages(newPages);

            cpmkCache[cacheKey] = { data: newData, meta: { total: newTotal, totalPages: newPages } };

        } catch (error) {
            console.error('Error fetching CPMK:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data');
            if (cpmkList.length === 0) setCpmkList([]);
        } finally {
            setLoading(false);
            hasLoadedRef.current = true;
        }
    }, [page, limit, searchTerm, selectedFakultas, selectedProdi, mataKuliahFilter]); // removed cpmkList dependency to avoid loop, but need ref access? No, functional update or just simple read is fine since useCallback captures state? 
    // Wait, if I use cpmkList.length inside useCallback, I need it in dependency array or use a ref.
    // If I put cpmkList in dependency, fetchCpmk changes every time list changes -> infinite loop if fetchCpmk is called in useEffect[fetchCpmk].
    // Better strategy: Use a separate `isInitialized` ref or state, or just check `page === 1` for loading?
    // Actually, `cpmkList` state variable inside `useCallback` will be stale if not in deps.
    // BUT, if I put it in deps, it triggers effect.
    // SOLUTION: Use `useRef` to track if we have data, OR just accept that `loading` implies "blocking UI".
    // Better: Just verify if we interpret "mereload data" as the Spinner appearing.
    // I can assume `page > 1` implies we have data? Not always.
    // Safest fix without Refs: just don't `setLoading(true)` if `page > 1`? But usually user wants to know it's fetching.
    // The user explicit request: "pagination... mereload data" (undesireable).
    // I will use a simple check: `setLoading(page === 1)`? No, filtering resets page to 1.
    // I will use a ref `hasLoadedOnce`.

    // Filter Side Effects
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchProdi(selectedFakultas !== 'all' ? selectedFakultas : undefined);
    }, [selectedFakultas, fetchProdi]);

    useEffect(() => {
        fetchMataKuliah(selectedProdi !== 'all' ? selectedProdi : undefined);
    }, [selectedProdi, fetchMataKuliah]);

    // Main data fetch on filter/page change
    useEffect(() => {
        fetchCpmk();
    }, [fetchCpmk]);

    // Reset page wrappers
    const handleSetSearchTerm = (val: string) => { setSearchTerm(val); setPage(1); };

    const handleSetSelectedFakultas = (val: string) => {
        setSelectedFakultas(val);
        setSelectedProdi("all");
        setMataKuliahFilter("all");
        setPage(1);
    };

    const handleSetSelectedProdi = (val: string) => {
        setSelectedProdi(val);
        setMataKuliahFilter("all");
        setPage(1);
    };

    const handleSetMataKuliahFilter = (val: string) => { setMataKuliahFilter(val); setPage(1); };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedFakultas("all");
        setSelectedProdi("all");
        setMataKuliahFilter("all");
        setPage(1);
    };

    const createCpmk = async (payload: any) => {
        try {
            await api.post('/cpmk', payload);
            toast.success("CPMK berhasil ditambahkan");
            toast.success("CPMK berhasil ditambahkan");
            Object.keys(cpmkCache).forEach(k => delete cpmkCache[k]);
            await fetchCpmk(true);
            return true;
        } catch (error: any) {
            console.error('Error saving CPMK:', error);
            toast.error(error.message || "Gagal menyimpan CPMK");
            return false;
        }
    };

    const updateCpmk = async (id: string, payload: any) => {
        try {
            await api.put(`/cpmk/${id}`, payload);
            toast.success("CPMK berhasil diupdate");
            toast.success("CPMK berhasil diupdate");
            Object.keys(cpmkCache).forEach(k => delete cpmkCache[k]);
            await fetchCpmk(true);
            return true;
        } catch (error: any) {
            console.error('Error saving CPMK:', error);
            toast.error(error.message || "Gagal menyimpan CPMK");
            return false;
        }
    };

    const deleteCpmk = async (id: string) => {
        try {
            await api.delete(`/cpmk/${id}`);
            toast.success("CPMK berhasil dihapus");
            toast.success("CPMK berhasil dihapus");
            Object.keys(cpmkCache).forEach(k => delete cpmkCache[k]);
            await fetchCpmk(true);
            return true;
        } catch (error: any) {
            console.error('Error deleting CPMK:', error);
            toast.error(error.message || "Gagal menghapus CPMK");
            return false;
        }
    };

    return {
        // Data
        cpmkList,
        fullCpmkList: cpmkList,
        mataKuliahList,
        fakultasList,
        prodiList,
        loading,

        // Filter States & Setters
        filters: {
            searchTerm,
            selectedFakultas,
            selectedProdi,
            mataKuliahFilter,
        },
        setSearchTerm: handleSetSearchTerm,
        setSelectedFakultas: handleSetSelectedFakultas,
        setSelectedProdi: handleSetSelectedProdi,
        setMataKuliahFilter: handleSetMataKuliahFilter,
        resetFilters,

        // Actions
        fetchInitialData,
        fetchProdi,
        fetchMataKuliah,
        fetchCpmk,
        createCpmk,
        updateCpmk,
        deleteCpmk,

        // Pagination
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        }
    };
}
