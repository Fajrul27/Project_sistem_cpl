import { useState, useEffect, useCallback } from "react";
import {
    fetchAnalisisCPL,
    fetchFakultasList,
    fetchProdiList,
    fetchAngkatanList,
    fetchJenjangList
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
    const [semester, setSemester] = useState("");
    const [fakultasFilter, setFakultasFilter] = useState("");
    const [jenjangFilter, setJenjangFilter] = useState("");
    const [prodiFilter, setProdiFilter] = useState("");

    // Lists for Filters
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [jenjangList, setJenjangList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Fetch Filter Options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [fakultasRes, jenjangRes, prodiRes] = await Promise.all([
                    fetchFakultasList(),
                    fetchJenjangList(),
                    fetchProdiList()
                ]);
                setFakultasList(fakultasRes.data || []);
                setJenjangList(jenjangRes.data || []);
                setProdiList(prodiRes.data || []);
            } catch (error) {
                console.error("Error loading filter options", error);
            }
        };
        loadOptions();
    }, []);

    const fetchAnalysisData = useCallback(async () => {
        // Enforce all filters are selected
        if (!semester || !fakultasFilter || !prodiFilter || semester === 'all' || fakultasFilter === 'all' || prodiFilter === 'all') {
            setCplData([]);
            setRadarData([]);
            setDistributionData([]);
            setLoading(false);
            return;
        }

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
        setSemester("");
        setFakultasFilter("");
        setJenjangFilter("");
        setProdiFilter("");
    };

    // Derived list for Prodi based on Fakultas and Jenjang selection
    const filteredProdiList = prodiList.filter(p => {
        const matchFakultas = fakultasFilter && fakultasFilter !== "all" ? p.fakultasId === fakultasFilter : true;
        const matchJenjang = jenjangFilter && jenjangFilter !== "all" ? p.jenjang === jenjangFilter : true;
        return matchFakultas && matchJenjang;
    });

    return {
        cplData,
        radarData,
        distributionData,
        semester,
        setSemester,
        fakultasFilter,
        setFakultasFilter,
        jenjangFilter,
        setJenjangFilter,
        prodiFilter,
        setProdiFilter,
        fakultasList,
        jenjangList,
        prodiList: filteredProdiList, // Return filtered list directly
        loading,
        resetFilters
    };
}
