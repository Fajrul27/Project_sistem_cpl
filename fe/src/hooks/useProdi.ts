import { useState, useEffect } from "react";
import { fetchProdiList } from "@/lib/api";
import { toast } from "sonner";

export interface Prodi {
    id: string;
    nama: string;
    kode?: string;
    jenjang?: string;
    fakultasId?: string;
}

export function useProdi() {
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProdi();
    }, []);

    const loadProdi = async () => {
        setLoading(true);
        try {
            const response = await fetchProdiList();
            setProdiList(response.data || []);
        } catch (error) {
            console.error("Error loading prodi:", error);
            toast.error("Gagal memuat data program studi");
        } finally {
            setLoading(false);
        }
    };

    return {
        prodiList,
        loading,
        refreshProdi: loadProdi
    };
}
