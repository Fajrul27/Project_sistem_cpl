import { useState, useEffect } from "react";
import { fetchAngkatanList } from "@/lib/api";
import { toast } from "sonner";

export interface Angkatan {
    id: string;
    tahun: number;
    isActive: boolean;
}

export function useAngkatan() {
    const [angkatanList, setAngkatanList] = useState<Angkatan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAngkatan();
    }, []);

    const loadAngkatan = async () => {
        setLoading(true);
        try {
            const response = await fetchAngkatanList();
            setAngkatanList(response.data || []);
        } catch (error) {
            console.error("Error loading angkatan:", error);
            toast.error("Gagal memuat data angkatan");
        } finally {
            setLoading(false);
        }
    };

    return {
        angkatanList,
        loading,
        refreshAngkatan: loadAngkatan
    };
}
