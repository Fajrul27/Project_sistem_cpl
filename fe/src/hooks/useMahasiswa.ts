import { useState, useCallback, useMemo, useEffect } from "react";
import { fetchMahasiswaList, fetchMataKuliahPengampu, fetchFakultasList, fetchTranskripCPL, fetchSemesters, fetchKelas, fetchProdiList } from "@/lib/api";
import { useUserRole } from "./useUserRole";
import { toast } from "sonner";

export interface Profile {
    id: string;
    full_name: string;
    nim: string | null;
    prodi: string | null;
    semester: number | null;
    fakultasId: string | null;
    fakultasName: string | null;
    kelasName: string | null;
    relatedCourses?: { id: string; nama: string; kode: string; semester: number }[];
}

export interface Fakultas {
    id: string;
    nama: string;
    kode: string;
}

export interface StudentProgress {
    avgScore: number;
    totalCPL: number;
    completedCPL: number;
    cplDetails: { id: string; kode: string; deskripsi: string; nilai: number; status?: string }[];
}

export interface MataKuliahPengampu {
    id: string;
    mataKuliahId: string;
    dosenId: string;
    isPengampu: boolean;
    mataKuliah: {
        id: string;
        kodeMk: string;
        namaMk: string;
        semester: number;
        prodi?: { id: string; nama: string };
    };
}

export function useMahasiswa() {
    const { role, userId, profile } = useUserRole();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliahPengampu[]>([]);

    // Global Filter Options State
    const [allProdis, setAllProdis] = useState<string[]>([]);
    const [allSemesters, setAllSemesters] = useState<string[]>([]);
    const [allKelas, setAllKelas] = useState<string[]>([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [semesterFilter, setSemesterFilter] = useState<string>("");
    const [prodiFilter, setProdiFilter] = useState<string>("");
    const [kelasFilter, setKelasFilter] = useState<string>("");
    const [fakultasFilter, setFakultasFilter] = useState<string>("");

    // Student Progress & Details
    const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
    const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
    const [progressLoading, setProgressLoading] = useState(false);

    // Load filter options (Global)
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [prodiRes, semRes, kelasRes] = await Promise.all([
                    fetchProdiList(),
                    fetchSemesters(),
                    fetchKelas()
                ]);

                // Extract data based on response structure
                let prodis: string[] = [];
                if (Array.isArray(prodiRes.data)) {
                    let prodiList = prodiRes.data;

                    // Security Filter for Filter Options
                    if (role === 'kaprodi' && profile?.prodiId) {
                        prodiList = prodiList.filter((p: any) => p.id === profile.prodiId);
                    } else if (role === 'dosen') {
                        // Filter by taught courses prodis
                        const taughtProdiIds = new Set(mataKuliahList.map(mk => mk.mataKuliah?.prodi?.id).filter(Boolean));
                        const taughtProdiNames = new Set(mataKuliahList.map(mk => mk.mataKuliah?.prodi?.nama).filter(Boolean));

                        prodiList = prodiList.filter((p: any) =>
                            taughtProdiIds.has(p.id) || taughtProdiNames.has(p.nama)
                        );
                    }

                    prodis = prodiList.map((p: any) => p.nama || p.programStudi).filter(Boolean);
                }


                let semesters: string[] = [];
                if (Array.isArray(semRes.data)) {
                    semesters = semRes.data.map((s: any) => String(s.angka || s.semester || s.nama || s)).filter(Boolean);
                }

                let kelasList: string[] = [];
                if (Array.isArray(kelasRes.data)) {
                    kelasList = kelasRes.data.map((k: any) => k.nama || k.kelas || k).filter(Boolean);
                }

                setAllProdis([...new Set(prodis)]);
                setAllSemesters([...new Set(semesters)].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b)));
                setAllKelas([...new Set(kelasList)].sort());

            } catch (error) {
                console.error("Error loading filter options:", error);
            }
        };

        loadFilterOptions();
    }, [mataKuliahList, role, profile]);

    // Initial Data Fetch
    const initializeData = useCallback(async () => {
        try {
            setLoading(true);

            let data: Profile[] = [];
            let meta = { totalPages: 1, total: 0 };

            // Params for pagination, search, and filters
            // Explicitly exclude undefined keys to prevent "undefined" string issue in URLSearchParams
            const params: any = {
                page,
                limit,
                q: searchTerm
            };

            if (semesterFilter !== "all") params.semester = semesterFilter;
            if (prodiFilter !== "all") params.prodi = prodiFilter;
            if (kelasFilter !== "all") params.kelas = kelasFilter;
            if (fakultasFilter !== "all") params.fakultasId = fakultasFilter;

            if (role === "dosen" && userId) {
                try {
                    const mkRes = await fetchMataKuliahPengampu(userId);
                    setMataKuliahList(mkRes.data || []);
                } catch (e) {
                    console.error("Error fetching taught courses", e);
                }
            }

            // Fetch data (Unified logic for all roles, backend handles security filtering)
            const res = await fetchMahasiswaList(params);
            const rawData = Array.isArray(res) ? res : (res.data || []);
            if (res.meta) meta = res.meta;

            data = rawData.map((u: any) => ({
                id: u.id,
                full_name: u.profile?.namaLengkap || u.email,
                nim: u.profile?.nim || "-",
                prodi: u.profile?.prodi?.nama || u.profile?.programStudi || "-",
                semester: u.profile?.semester || 0,
                fakultasId: u.profile?.fakultasId || u.profile?.prodi?.fakultasId,
                fakultasName: u.profile?.prodi?.fakultas?.nama || u.profile?.fakultasName,
                kelasName: u.profile?.kelasRef?.nama || u.profile?.kelasId || "-",
                relatedCourses: u.relatedCourses || []
            }));

            setProfiles(data);
            setTotalPages(meta.totalPages);
            setTotalItems(meta.total);

        } catch (error) {
            console.error("Error fetching mahasiswa:", error);
            toast.error("Gagal memuat data mahasiswa");
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, semesterFilter, prodiFilter, kelasFilter, fakultasFilter]);

    const loadFakultas = useCallback(async () => {
        try {
            const res = await fetchFakultasList();
            setFakultasList(res.data || []);
        } catch (error) {
            console.error("Error fetching fakultas", error);
        }
    }, []);

    // Fetch individual student progress
    const fetchStudentProgressData = useCallback(async (studentId: string) => {
        if (!studentId) return;

        try {
            setProgressLoading(true);
            const res = await fetchTranskripCPL(studentId);

            // Handle nested data structure { success: true, data: { ... } }
            const data = res.data || res;

            // Calculate progress stats from transcript
            if (data.transkrip) {
                const items = data.transkrip;
                const avg = items.reduce((sum: number, item: any) => sum + parseFloat(item.nilaiAkhir), 0) / (items.length || 1);

                setStudentProgress({
                    avgScore: avg,
                    totalCPL: items.length,
                    completedCPL: items.filter((i: any) => i.status === 'tercapai').length,
                    cplDetails: items.map((i: any) => ({
                        id: i.cplId,
                        kode: i.cpl?.kodeCpl || '?',
                        deskripsi: i.cpl?.deskripsi || 'Tidak ada deskripsi',
                        nilai: parseFloat(i.nilaiAkhir),
                        status: i.status
                    })).sort((a: any, b: any) => {
                        // Sort by kode CPL properly (CPL-1, CPL-2, CPL-10)
                        const numA = parseInt(a.kode.replace(/\D/g, '')) || 0;
                        const numB = parseInt(b.kode.replace(/\D/g, '')) || 0;
                        return numA - numB;
                    })
                });
            } else if (res.items) {
                // Fallback for older response structure
                const items = res.items;
                const avg = items.reduce((sum: number, item: any) => sum + parseFloat(item.nilaiAkhir), 0) / (items.length || 1);
                setStudentProgress({
                    avgScore: avg,
                    totalCPL: items.length,
                    completedCPL: items.filter((i: any) => parseFloat(i.nilaiAkhir) > 0).length,
                    cplDetails: items.map((i: any) => ({
                        kode: i.cpl?.kodeCpl || '?',
                        nilai: parseFloat(i.nilaiAkhir),
                        status: i.status
                    }))
                });
            }
        } catch (error) {
            console.error("Error fetching student progress:", error);
            toast.error("Gagal memuat progress mahasiswa");
        } finally {
            setProgressLoading(false);
        }
    }, []);

    const filteredProfiles = useMemo(() => {
        // Since filtering is now handled server-side, just return profiles
        return profiles;
    }, [profiles]);

    // Wrappers to reset page on filter change
    const handleSetSearchTerm = useCallback((term: string) => {
        setSearchTerm(term);
        setPage(1);
    }, []);

    const handleSetSemesterFilter = useCallback((val: string) => {
        setSemesterFilter(val);
        setPage(1);
    }, []);

    const handleSetProdiFilter = useCallback((val: string) => {
        setProdiFilter(val);
        setPage(1);
    }, []);

    const handleSetKelasFilter = useCallback((val: string) => {
        setKelasFilter(val);
        setPage(1);
    }, []);

    const handleSetFakultasFilter = useCallback((val: string) => {
        setFakultasFilter(val);
        setPage(1);
    }, []);

    return {
        // Data
        profiles: filteredProfiles,
        fullProfiles: profiles,
        fakultasList,
        mataKuliahList,
        studentProgress,
        selectedStudent,
        loading,
        progressLoading,
        user: profile,

        // Pagination
        pagination: {
            page,
            setPage,
            totalPages,
            totalItems,
            limit
        },

        // Filters
        filters: {
            searchTerm,
            semesterFilter,
            prodiFilter,
            kelasFilter,
            fakultasFilter
        },
        uniqueOptions: {
            prodis: allProdis,
            semesters: allSemesters,
            kelas: allKelas
        },
        setSearchTerm: handleSetSearchTerm,
        setSemesterFilter: handleSetSemesterFilter,
        setProdiFilter: handleSetProdiFilter,
        setKelasFilter: handleSetKelasFilter,
        setFakultasFilter: handleSetFakultasFilter,
        setSelectedStudent,

        // Actions
        initializeData,
        loadFakultas,
        fetchStudentProgressData
    };
}
