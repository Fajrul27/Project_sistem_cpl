import { useState, useEffect } from "react";
import { fetchFakultasList } from "@/lib/api";
import { toast } from "sonner";

export interface Fakultas {
    id: string;
    nama: string;
    kode: string;
}

export function useFakultas() {
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFakultas();
    }, []);

    const loadFakultas = async () => {
        setLoading(true);
        try {
            const response = await fetchFakultasList();
            setFakultasList(response.data || []);
        } catch (error) {
            console.error("Error loading fakultas:", error);
            toast.error("Gagal memuat data fakultas");
        } finally {
            setLoading(false);
        }
    };

    return {
        fakultasList,
        loading,
        refreshFakultas: loadFakultas
    };
}
