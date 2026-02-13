import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface KrsEntry {
    id: string;
    mahasiswaId: string;
    mataKuliahId: string;
    semesterId: string;
    tahunAjaranId: string;
    mahasiswa: {
        userId: string;
        namaLengkap: string;
        nim: string;
        prodi?: { nama: string };
    };
    mataKuliah: {
        id: string;
        kodeMk: string;
        namaMk: string;
        sks: number;
    };
    semester: {
        id: string;
        nama: string;
        angka: number;
    };
    tahunAjaran: {
        id: string;
        nama: string;
    };
}

export const useKrs = () => {
    const [krsList, setKrsList] = useState<KrsEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState<{ successCount: number; errors?: string[] } | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    const [filters, setFilters] = useState({
        prodiId: "",
        semesterId: "",
        tahunAjaranId: "",
        kelasId: "",
        q: ""
    });

    const fetchKrs = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                q: filters.q
            };
            if (filters.prodiId) params.prodiId = filters.prodiId;
            if (filters.semesterId) params.semesterId = filters.semesterId;
            if (filters.tahunAjaranId) params.tahunAjaranId = filters.tahunAjaranId;
            if (filters.kelasId) params.kelasId = filters.kelasId;

            const result = await api.get('/krs', { params });

            // Result is expected to be { data: KrsEntry[], meta: { total, page, limit, totalPages } }
            const data = result?.data || [];
            const meta = result?.meta || { total: 0, totalPages: 1 };

            setKrsList(Array.isArray(data) ? data : []);
            setPagination(prev => ({
                ...prev,
                total: meta.total || 0,
                totalPages: meta.totalPages || 1
            }));
        } catch (error: any) {
            console.error("Fetch KRS error:", error);
            toast.error("Gagal mengambil data KRS");
        } finally {
            setLoading(false);
        }
    }, [filters.prodiId, filters.semesterId, filters.tahunAjaranId, filters.kelasId, filters.q, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchKrs();
    }, [fetchKrs]);

    const importKrs = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/krs/import", formData);

            setImportResult({
                successCount: response.successCount || 0,
                errors: response.errors
            });

            if (response.errors && response.errors.length > 0) {
                toast.warning(`Import selesai: ${response.successCount || 0} berhasil, ${response.errors.length} gagal.`);
            } else {
                toast.success(response.message || "Import berhasil");
            }
            fetchKrs();
            return true;
        } catch (error: any) {
            toast.error(error.message || "Gagal mengimport KRS");
            return false;
        }
    };

    const deleteKrs = async (id: string) => {
        try {
            await api.delete(`/krs/${id}`);
            toast.success("Data KRS berhasil dihapus");
            fetchKrs();
            return true;
        } catch (error: any) {
            toast.error("Gagal menghapus data KRS");
            return false;
        }
    };

    const createKrs = async (data: any) => {
        try {
            await api.post("/krs", data);
            toast.success("Data KRS berhasil ditambahkan");
            fetchKrs();
            return true;
        } catch (error: any) {
            toast.error(error.message || "Gagal menambahkan data KRS");
            return false;
        }
    };

    return {
        krsList,
        loading,
        pagination,
        filters,
        setFilters,
        setPage: (page: number) => setPagination(prev => ({ ...prev, page })),
        importKrs,
        importResult,
        setImportResult,
        deleteKrs,
        createKrs,
        refresh: fetchKrs
    };
};
