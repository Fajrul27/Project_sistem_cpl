import { useState, useEffect, useCallback } from "react";
import { fetchAnalisisCPL } from "@/lib/api";
import { toast } from "sonner";

export interface DashboardPageProps {
    // Add props if needed
}

export function useAnalisis() {
    const [cplData, setCplData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);
    const [semester, setSemester] = useState("all");
    const [loading, setLoading] = useState(true);

    const fetchAnalysisData = useCallback(async () => {
        try {
            const response = await fetchAnalisisCPL(semester);

            if (response) {
                setCplData(response.cplData || []);
                setRadarData(response.radarData || []);
                setDistributionData(response.distributionData || []);
            }
        } catch (error: any) {
            toast.error("Gagal memuat data analisis");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [semester]);

    useEffect(() => {
        fetchAnalysisData();
    }, [fetchAnalysisData]);

    return {
        cplData,
        radarData,
        distributionData,
        semester,
        setSemester,
        loading
    };
}
