import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

export interface CPLData {
    id: string;
    kodeCpl: string;
    deskripsi: string;
    kategori: string;
    kategoriRef?: { id: string; nama: string };
    bobot: number;
    mataKuliah?: any[];
}

export function useCPLDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cpl, setCpl] = useState<CPLData | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCPL = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/cpl/${id}`);
                if (response.data) {
                    setCpl(response.data);

                    // Fetch real stats from backend
                    try {
                        const statsResponse = await api.get(`/cpl/${id}/stats`);
                        setStats(statsResponse);
                    } catch (statsError) {
                        console.error("Error fetching stats:", statsError);
                        // Fallback to empty stats if fetch fails
                        setStats({
                            avgNilai: 0,
                            trend: "stable",
                            totalMahasiswa: 0,
                            totalMK: response.data.mataKuliah?.length || 0,
                            semesterData: [],
                            distribution: [],
                            mkData: []
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching CPL:", error);
                toast.error("Gagal memuat detail CPL");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCPL();
        }
    }, [id]);

    const getTrendColor = () => {
        if (stats?.trend === "up") return "success";
        if (stats?.trend === "down") return "destructive";
        return "secondary";
    };

    return {
        cpl,
        stats,
        loading,
        navigate,
        getTrendColor
    };
}
