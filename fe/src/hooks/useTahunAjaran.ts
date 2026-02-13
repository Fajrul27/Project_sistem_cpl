
import { useState, useEffect } from "react";
import { fetchTahunAjaranList, api } from "@/lib/api";
import { toast } from "sonner";

export interface TahunAjaran {
    id: string;
    nama: string;
    isActive: boolean;
}

export function useTahunAjaran() {
    const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
    const [loading, setLoading] = useState(true);

    const loadParams = async () => {
        setLoading(true);
        try {
            const res = await fetchTahunAjaranList();
            setTahunAjaranList(res.data);
        } catch (error) {
            console.error("Failed to load tahun ajaran:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadParams();
    }, []);

    const createTahunAjaran = async (data: { nama: string; isActive?: boolean }) => {
        try {
            await api.post("/tahun-ajaran", data);
            toast.success("Tahun ajaran berhasil dibuat");
            loadParams();
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Gagal membuat tahun ajaran");
            return false;
        }
    };

    const updateTahunAjaran = async (id: string, data: { nama?: string; isActive?: boolean }) => {
        try {
            await api.put(`/tahun-ajaran/${id}`, data);
            toast.success("Tahun ajaran berhasil diperbarui");
            loadParams();
            return true;
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Gagal memperbarui tahun ajaran";
            toast.error(message);
            return false;
        }
    };

    const deleteTahunAjaran = async (id: string) => {
        try {
            await api.delete(`/tahun-ajaran/${id}`);
            toast.success("Tahun ajaran berhasil dihapus");
            loadParams();
            return true;
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.error || "Gagal menghapus tahun ajaran";
            toast.error(message);
            return false;
        }
    };

    const setTahunAjaranActive = async (id: string) => {
        return updateTahunAjaran(id, { isActive: true });
    };

    const activeTahunAjaran = tahunAjaranList.find(ta => ta.isActive);

    return {
        tahunAjaranList,
        loading,
        activeTahunAjaran,
        createTahunAjaran,
        updateTahunAjaran,
        deleteTahunAjaran,
        setTahunAjaranActive,
        refresh: loadParams
    };
}
