import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export interface ProfilLulusan {
    id: string;
    kode: string;
    nama: string;
    deskripsi: string;
    prodiId: string;
    prodi?: { nama: string; fakultasId?: string };
    percentage?: number;
    status?: string;
    cplMappings?: { cplId: string; cpl?: { kode: string } }[];
}

export interface Prodi {
    id: string;
    nama: string;
    fakultasId?: string;
}

export interface CPL {
    id: string;
    kode: string;
    deskripsi: string;
}

// Simple Cache
const profilCache: Record<string, any> = {};

export const useProfilLulusan = () => {
    const { role, profile, loading: roleLoading } = useUserRole();

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const [searchTerm, setSearchTerm] = useState("");

    const [profilList, setProfilList] = useState<ProfilLulusan[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [fakultasList, setFakultasList] = useState<{ id: string; nama: string }[]>([]);
    const [cplList, setCplList] = useState<CPL[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("");
    const [selectedProdi, setSelectedProdi] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        try {
            // Fetch Prodi List logic
            if (role === "admin") {
                const res = await api.get("/references/fakultas");
                setFakultasList(res.data);
                // Removed auto-select for admin
                setLoading(false); // Ensure loading is turned off since we are not auto-fetching
            } else if ((role === "kaprodi" || role === "dosen" || role === "mahasiswa") && profile?.prodiId) {
                if (!selectedProdi) {
                    setSelectedProdi(profile.prodiId);
                }
            } else if (role === "kaprodi" || role === "dosen" || role === "mahasiswa") {
                // Wait for profile to load
            } else {
                // Fallback for edge cases
                const res = await api.get("/prodi");
                setProdiList(res.data);
                // Removed auto-select for fallback
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data awal");
        }
    }, [role, profile, selectedProdi]);

    // Fetch Prodi when Fakultas changes (for Admin)
    useEffect(() => {
        if (role === "admin" && selectedFakultas) {
            const fetchProdi = async () => {
                try {
                    const res = await api.get(`/prodi?fakultasId=${selectedFakultas}`);
                    setProdiList(res.data);
                } catch (error) {
                    console.error("Error fetching prodi:", error);
                }
            };
            fetchProdi();
        } else if (role === "admin" && !selectedFakultas) {
            setProdiList([]);
        }
    }, [selectedFakultas, role]);

    const [searchBy, setSearchBy] = useState<'all' | 'prodi'>('all');

    const fetchProfilLulusan = useCallback(async (prodiId: string, force = false) => {
        // Allow fetch if prodiId is present OR if searchTerm is present (Global Search)
        if (!prodiId && !searchTerm) return;

        const cacheKey = `${prodiId || 'global'}-${page}-${limit}-${searchTerm}-${searchBy}`;

        if (!force && profilCache[cacheKey]) {
            // Restore from cache immediately
            const cached = profilCache[cacheKey];
            setProfilList(cached.data);
            setTotalItems(cached.totalItems);
            setTotalPages(cached.totalPages);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const params: any = {
                page,
                limit,
                q: searchTerm,
                searchBy
            };

            if (prodiId) {
                params.prodiId = prodiId;
            }

            const res = await api.get('/profil-lulusan', { params });

            let newData: any[] = [];
            let newTotal = 0;
            let newPages = 1;

            if (res.data && res.meta) {
                newData = res.data;
                newTotal = res.meta.total;
                newPages = res.meta.totalPages;
            } else if (res.data && res.data.data && res.data.meta) { // Wrapper case
                newData = res.data.data;
                newTotal = res.data.meta.total;
                newPages = res.data.meta.totalPages;
            } else if (Array.isArray(res.data)) {
                newData = res.data;
                newTotal = res.data.length;
                newPages = 1;
            } else {
                newData = [];
            }

            setProfilList(newData);
            setTotalItems(newTotal);
            setTotalPages(newPages);

            // Save to cache
            profilCache[cacheKey] = {
                data: newData,
                totalItems: newTotal,
                totalPages: newPages
            };

        } catch (error) {
            console.error("Error fetching profil lulusan:", error);
            toast.error("Gagal memuat data profil lulusan");
            setProfilList([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, searchBy]);

    const fetchProfilLulusanAnalysis = useCallback(async (mahasiswaId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/transkrip-profil/mahasiswa/${mahasiswaId}`);
            const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
            setProfilList(data);
            setTotalItems(data.length);
            setTotalPages(1); // Analysis doesn't support pagination yet in this context usually
        } catch (error) {
            console.error("Error fetching profil lulusan analysis:", error);
            toast.error("Gagal memuat analisis profil lulusan");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCpls = useCallback(async (prodiId: string) => {
        if (!prodiId) return;
        try {
            const res = await api.get(`/cpl?prodiId=${prodiId}`);
            // Handle CPL response structure (it might be { data, meta } now)
            if (res.data && Array.isArray(res.data)) {
                setCplList(res.data);
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                setCplList(res.data.data); // If wrapped
            } else if (Array.isArray(res.data)) {
                setCplList(res.data);
            } else {
                setCplList([]);
            }
        } catch (error) {
            console.error("Error fetching CPLs:", error);
        }
    }, []);

    // Effect to load initial data
    useEffect(() => {
        if (!roleLoading) {
            fetchInitialData();
        }
    }, [roleLoading, fetchInitialData]);

    // Effect to fetch Profil and CPLs when selectedProdi changes OR searchTerm changes
    useEffect(() => {
        if (selectedProdi || searchTerm) {
            if (role === "mahasiswa" && profile?.userId) {
                fetchProfilLulusanAnalysis(profile.userId);
            } else {
                fetchProfilLulusan(selectedProdi);
            }
            if (selectedProdi) {
                fetchCpls(selectedProdi);
            }
        }
    }, [selectedProdi, searchTerm, role, profile, fetchProfilLulusan, fetchProfilLulusanAnalysis, fetchCpls]);

    // Reset pagination when filter changes
    const handleSetSelectedProdi = (val: string) => {
        setSelectedProdi(val);
        setPage(1);
    }

    const handleSetSearchTerm = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    }

    const createProfil = async (data: any) => {
        try {
            await api.post("/profil-lulusan", data);
            toast.success("Berhasil ditambahkan");
            toast.success("Berhasil ditambahkan");
            // Invalidate cache by clearing relevant keys or simple force fetch
            // Ideally clear keys starting with prodiId... but simple force works for current view
            // Better: clear all cache for this prodi to be safe or intelligent key filtering
            const cacheKeyPrefix = `${selectedProdi}-`;
            Object.keys(profilCache).forEach(k => { if (k.startsWith(cacheKeyPrefix)) delete profilCache[k]; });

            await fetchProfilLulusan(selectedProdi, true);
            return true;
        } catch (error: any) {
            console.error("Error creating profil:", error);
            toast.error(error.response?.data?.error || "Gagal menyimpan data");
            return false;
        }
    };

    const updateProfil = async (id: string, data: any) => {
        try {
            await api.put(`/profil-lulusan/${id}`, data);
            toast.success("Berhasil diperbarui");
            toast.success("Berhasil diperbarui");
            const cacheKeyPrefix = `${selectedProdi}-`;
            Object.keys(profilCache).forEach(k => { if (k.startsWith(cacheKeyPrefix)) delete profilCache[k]; });
            await fetchProfilLulusan(selectedProdi, true);
            return true;
        } catch (error: any) {
            console.error("Error updating profil:", error);
            toast.error(error.response?.data?.error || "Gagal menyimpan data");
            return false;
        }
    };

    const deleteProfil = async (id: string) => {
        try {
            await api.delete(`/profil-lulusan/${id}`);
            toast.success("Berhasil dihapus");
            toast.success("Berhasil dihapus");
            const cacheKeyPrefix = `${selectedProdi}-`;
            Object.keys(profilCache).forEach(k => { if (k.startsWith(cacheKeyPrefix)) delete profilCache[k]; });
            await fetchProfilLulusan(selectedProdi, true);
            return true;
        } catch (error) {
            console.error("Error deleting profil:", error);
            toast.error("Gagal menghapus");
            return false;
        }
    };

    return {
        profilList,
        prodiList,
        fakultasList,
        cplList,
        selectedFakultas,
        setSelectedFakultas,
        selectedProdi,
        setSelectedProdi: handleSetSelectedProdi,
        loading,
        createProfil,
        updateProfil,
        deleteProfil,
        // Pagination & Search
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        },
        searchTerm,
        setSearchTerm: handleSetSearchTerm,
        searchBy,
        setSearchBy,
        fetchProfilLulusan
    };
};
