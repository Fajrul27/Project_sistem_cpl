import { useState, useEffect, useCallback } from "react";
import {
    fetchAnalisisCPL,
    fetchFakultasList,
    fetchProdiList,
    fetchJenjangList
} from "@/lib/api";
import { useUserRole } from "@/hooks/useUserRole";
import { useDosenTeachingInfo } from "@/hooks/useDosenTeachingInfo";
import { toast } from "sonner";

export interface DashboardPageProps {
    // Add props if needed
}

export function useAnalisis() {
    const { role, profile, loading: roleLoading } = useUserRole();
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

    // Dosen Teaching Info
    const { taughtSemesters } = useDosenTeachingInfo();

    const [loading, setLoading] = useState(true);

    // Role-based filter initialization
    useEffect(() => {
        if (!roleLoading && role !== "admin") {
            if (profile?.prodiId) {
                setProdiFilter(profile.prodiId);
                const fId = profile.fakultasId || (profile.prodi as any)?.fakultasId;
                if (fId) {
                    setFakultasFilter(fId);
                }
                if (profile.prodi?.jenjang) {
                    setJenjangFilter(profile.prodi.jenjang);
                }
            }
        }
    }, [roleLoading, role, profile]);

    // Dosen Semester Auto-select
    useEffect(() => {
        if ((role as string) === 'dosen') {
            if (taughtSemesters.length === 1) {
                const singleSemester = taughtSemesters[0].toString();
                if (semester !== singleSemester) {
                    setSemester(singleSemester);
                }
            }
        } else if ((role as string) !== 'dosen' && !semester) {
            // For Admin/Kaprodi default to Semester 1 or All
            // Ideally we force user to select, but previously it was "1"
            // Let's set it to "1" to match previous behavior for non-dosen
            // Or keep it empty? User asked "defaultnya pilih semester"
            // If I keep it empty, it forces selection.
            // Given the complaint was specifically about Dosen, let's just handle Dosen.
        }
    }, [role, taughtSemesters, semester]);

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

    // Determine effective semester list
    const semesterList = (role === 'dosen' && taughtSemesters.length > 0)
        ? taughtSemesters.map(s => ({ id: s.toString(), nama: `Semester ${s}` }))
        : [1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ id: s.toString(), nama: `Semester ${s}` }));

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
        prodiList: filteredProdiList,
        semesterList,
        loading,
        resetFilters
    };
}
