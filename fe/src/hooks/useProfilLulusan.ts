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
    prodi?: { nama: string };
    percentage?: number;
    status?: string;
    cplMappings?: { cplId: string; cpl?: { kode: string } }[];
}

export interface Prodi {
    id: string;
    nama: string;
}

export interface CPL {
    id: string;
    kode: string;
    deskripsi: string;
}

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
    const [cplList, setCplList] = useState<CPL[]>([]);
    const [selectedProdi, setSelectedProdi] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const fetchInitialData = useCallback(async () => {
        try {
            // Fetch Prodi List logic
            if (role === "admin") {
                const res = await api.get("/prodi");
                setProdiList(res.data);
                if (res.data.length > 0 && !selectedProdi) {
                    setSelectedProdi(res.data[0].id);
                }
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
                if (res.data.length > 0 && !selectedProdi) {
                    setSelectedProdi(res.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data prodi");
        }
    }, [role, profile, selectedProdi]);

    const fetchProfilLulusan = useCallback(async (prodiId: string) => {
        if (!prodiId) return;
        setLoading(true);
        try {
            const params = {
                prodiId,
                page,
                limit,
                q: searchTerm
            };
            const res = await api.get('/profil-lulusan', { params });

            if (res.data && res.meta) {
                setProfilList(res.data);
                setTotalItems(res.meta.total);
                setTotalPages(res.meta.totalPages);
            } else if (res.data && res.data.data && res.data.meta) { // Wrapper case
                setProfilList(res.data.data);
                setTotalItems(res.data.meta.total);
                setTotalPages(res.data.meta.totalPages);
            } else if (Array.isArray(res.data)) {
                // Fallback legacy
                setProfilList(res.data);
                setTotalItems(res.data.length);
                setTotalPages(1);
            } else {
                setProfilList([]);
            }

        } catch (error) {
            console.error("Error fetching profil lulusan:", error);
            toast.error("Gagal memuat data profil lulusan");
            setProfilList([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

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

    // Effect to fetch Profil and CPLs when selectedProdi changes
    useEffect(() => {
        if (selectedProdi) {
            if (role === "mahasiswa" && profile?.userId) {
                fetchProfilLulusanAnalysis(profile.userId);
            } else {
                fetchProfilLulusan(selectedProdi);
            }
            fetchCpls(selectedProdi);
        }
    }, [selectedProdi, role, profile, fetchProfilLulusan, fetchProfilLulusanAnalysis, fetchCpls]);

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
            await fetchProfilLulusan(selectedProdi);
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
            await fetchProfilLulusan(selectedProdi);
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
            await fetchProfilLulusan(selectedProdi);
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
        cplList,
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
        setSearchTerm: handleSetSearchTerm
    };
};
