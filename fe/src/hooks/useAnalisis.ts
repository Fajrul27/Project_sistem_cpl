import { useState, useEffect, useCallback } from "react";
import {
    fetchAnalisisCPL,
    fetchFakultasList,
    fetchProdiList,
    fetchAngkatanList
} from "@/lib/api";
import { toast } from "sonner";

export interface DashboardPageProps {
    // Add props if needed
}

export function useAnalisis() {
    const [cplData, setCplData] = useState<any[]>([]);
    const [radarData, setRadarData] = useState<any[]>([]);
    const [distributionData, setDistributionData] = useState<any[]>([]);

    // Filter State
    const [semester, setSemester] = useState("all");
    const [fakultasFilter, setFakultasFilter] = useState("all");
    const [prodiFilter, setProdiFilter] = useState("all");

    // Lists for Filters
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Fetch Filter Options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [fakultasRes, prodiRes] = await Promise.all([
                    fetchFakultasList(),
                    fetchProdiList()
                ]);
                setFakultasList(fakultasRes.data || []);
                setProdiList(prodiRes.data || []);
            } catch (error) {
                console.error("Error loading filter options", error);
            }
        };
        loadOptions();
    }, []);

    const fetchAnalysisData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchAnalisisCPL(semester, fakultasFilter, prodiFilter);

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
    }, [semester, fakultasFilter, prodiFilter]);

    useEffect(() => {
        fetchAnalysisData();
    }, [fetchAnalysisData]);

    const resetFilters = () => {
        setSemester("all");
        setFakultasFilter("all");
        setProdiFilter("all");
    };

    // Derived list for Prodi based on Fakultas selection
    const filteredProdiList = fakultasFilter !== "all"
        ? prodiList.filter(p => p.fakultasId === fakultasFilter)
        : prodiList;

    return {
        cplData,
        radarData,
        distributionData,
        semester,
        setSemester,
        fakultasFilter,
        setFakultasFilter,
        prodiFilter,
        setProdiFilter,
        fakultasList,
        prodiList: filteredProdiList, // Return filtered list directly
        loading,
        resetFilters
    };
}
