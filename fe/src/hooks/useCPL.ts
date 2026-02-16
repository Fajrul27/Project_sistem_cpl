import { useState, useCallback, useMemo, useEffect } from "react";
import { api, fetchMataKuliahPengampu } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
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
    const { role, userId, profile, loading: roleLoading } = useUserRole();
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
    const [fullCplList, setFullCplList] = useState<CPL[]>([]); // New state for non-paginated list
    const [kategoriList, setKategoriList] = useState<any[]>([]);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [accessibleProdis, setAccessibleProdis] = useState<any[]>([]);
    const [kurikulumList, setKurikulumList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Role-based filter initialization
    useEffect(() => {
        const initFilters = async () => {
            if (!roleLoading && role !== "admin") {
                if (role === 'dosen' && userId) {
                    try {
                        const mkRes = await fetchMataKuliahPengampu(userId);
                        const uniqueProdis = new Map<string, any>();

                        // Add own prodi
                        if (profile.prodi) {
                            uniqueProdis.set(profile.prodi.id, profile.prodi);
                        } else if (profile.prodiId) {
                            // We might not have the name if it's just ID, but it will befetched in prodiList
                            // If we want to force select, we can use ID.
                            uniqueProdis.set(profile.prodiId, { id: profile.prodiId, nama: "Loading..." });
                        }

                        // Add taught prodis
                        mkRes.data?.forEach((mk: any) => {
                            const p = mk.mataKuliah?.prodi || mk.prodi;
                            if (p) {
                                uniqueProdis.set(p.id, p);
                            }
                        });

                        const accessibleProdisList = Array.from(uniqueProdis.values());
                        setAccessibleProdis(accessibleProdisList);

                        // If only 1 prodi, lock it
                        if (accessibleProdisList.length === 1) {
                            const prodiId = accessibleProdisList[0].id;
                            // Explicitly set the prodi filter here
                            setProdiFilter(prodiId);
                            if (accessibleProdisList[0].fakultasId) setFakultasFilter(accessibleProdisList[0].fakultasId);
                        } else if (accessibleProdisList.length > 1) {
                            // If multiple, default to "all"
                            setProdiFilter("all");
                        }

                        // Set prodi list directly here to avoid waiting for fetchProdi
                        setProdiList(accessibleProdisList);

                    } catch (e) {
                        console.error("Error init filters for dosen:", e);
                    }
                } else if (profile?.prodiId) {
                    setProdiFilter(profile.prodiId);
                    if (profile.fakultasId || (profile.prodi as any)?.fakultasId) {
                        setFakultasFilter(profile.fakultasId || (profile.prodi as any)?.fakultasId);
                    }
                }
            }
        };
        initFilters();
    }, [roleLoading, role, userId, profile]);

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
            // For Dosen with limited access, use accessibleProdis if available
            if (role === 'dosen' && accessibleProdis.length > 0) {
                setProdiList(accessibleProdis);
                return;
            }

            const url = fakultasFilter && fakultasFilter !== 'all' ? `/prodi?fakultasId=${fakultasFilter}` : '/prodi';
            const result = await api.get(url);
            if (result.data) {
                // If Dosen but accessibleProdis is empty (fetching failed or explicitly empty), 
                // we might want to still restrict prodiList to profile.prodiId if available
                if (role === 'dosen' && profile?.prodiId) {
                    setProdiList(result.data.filter((p: any) => p.id === profile.prodiId));
                } else {
                    setProdiList(result.data);
                }
            }
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, [fakultasFilter, role, accessibleProdis, profile]);

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

            if (prodiFilter !== "all" && prodiFilter !== "") params.prodiId = prodiFilter;
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

    // New function to fetch all CPLs for matrix/target views
    const fetchFullCPL = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                limit: -1, // Bypass pagination on backend
                q: searchTerm
            };

            if (prodiFilter !== "all" && prodiFilter !== "") params.prodiId = prodiFilter;
            if (kategoriFilter !== "all") params.kategori = kategoriFilter;
            if (kurikulumFilter !== "all") params.kurikulumId = kurikulumFilter;

            const response = await api.get('/cpl', { params });
            const data = response.data?.data || response.data || [];
            setFullCplList(data);
        } catch (error) {
            console.error('Error fetching full CPL list:', error);
            setFullCplList([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, prodiFilter, kategoriFilter, kurikulumFilter]);

    // Initial Data Fetch
    useEffect(() => {
        fetchKategori();
        fetchFakultas();
        fetchKurikulum();
    }, [fetchKategori, fetchFakultas, fetchKurikulum]);

    // Data Fetch on Filter Change
    useEffect(() => {
        fetchCPL();
        fetchFullCPL(); // Also fetch full list for background views (matrix/target)
    }, [page, searchTerm, prodiFilter, kategoriFilter, kurikulumFilter, fetchCPL, fetchFullCPL]);

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
        fullCplList,
        kategoriList,
        fakultasList,
        prodiList,
        accessibleProdis,
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

        // Create derived options based on current CPL list content to filter out irrelevant options
        kategoriOptions: kategoriList,
        kurikulumOptions: kurikulumList,

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
        fullCplList,
        kategoriList,
        fakultasList,
        prodiList,
        accessibleProdis,
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
