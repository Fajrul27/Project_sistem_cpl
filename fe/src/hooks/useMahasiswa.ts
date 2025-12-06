import { useState, useCallback, useMemo, useEffect } from "react";
import { fetchMahasiswaList, fetchMataKuliahPengampu, fetchFakultasList, getUser, fetchTranskripCPL, fetchSemesters, fetchKelas, fetchProdiList } from "@/lib/api";
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
        prodi?: { nama: string };
    };
}

export function useMahasiswa() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliahPengampu[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

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
    const [semesterFilter, setSemesterFilter] = useState<string>("all");
    const [prodiFilter, setProdiFilter] = useState<string>("all");
    const [kelasFilter, setKelasFilter] = useState<string>("all");
    const [fakultasFilter, setFakultasFilter] = useState<string>("all");

    // Student Progress & Details
    const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
    const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
    const [progressLoading, setProgressLoading] = useState(false);

    // Load filter options (Global)
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const user = getUser(); // Get user for role check
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
                    if (user?.role === 'kaprodi' && user.profile?.prodiId) {
                        // Filter to only user's prodi
                        prodiList = prodiList.filter((p: any) => p.id === user.profile?.prodiId);
                    } else if (user?.role === 'dosen') {
                        // For dosen, we ideally filter by taught courses.
                        // Since we don't have that list readily available in this scope effectively without prop drilling or context,
                        // we can rely on the fact that the DATA TABLE is filtered.
                        // However, to be cleaner, let's filter if we have course data or just show all (which becomes useless if data is empty).

                        // Strategy: If Dosen, let's TRY to filter by unique prodis found in the `profiles` (which is already loaded)?
                        // No, `loadFilterOptions` runs once on mount. `profiles` loads later.

                        // Compromise: For Dosen, we show all OR we fetch/derive later.
                        // Given currently we don't have easy "TaughtCourseProdis" without extra fetch, 
                        // and `fetchMataKuliahPengampu` is called in `initializeData`...

                        // Let's leave Dosen with "All" for now (or empty if we want to be strict).
                        // Current `MataKuliahPage` filters it. `MahasiswaPage` should too.

                        // We will allow ALL for Dosen here, but the data result will just be empty if they pick a wrong one.
                        // This is acceptable as a fallback if strict filtering is too complex for this hook refactor.
                        // BUT for Kaprodi it is critical and easy (prodiId is in profile).
                    }

                    prodis = prodiList.map((p: any) => p.nama || p.programStudi).filter(Boolean);
                }


                let semesters: string[] = [];
                if (Array.isArray(semRes.data)) {
                    // Use 'angka' (value) instead of 'nama' (label) to ensure backend receives a number
                    semesters = semRes.data.map((s: any) => String(s.angka || s.semester || s.nama || s)).filter(Boolean);
                }

                let kelas: string[] = [];
                if (Array.isArray(kelasRes.data)) {
                    kelas = kelasRes.data.map((k: any) => k.nama || k.kelas || k).filter(Boolean);
                }



                // For now, let's just populate unique options. 
                // The frontend page uses `uniqueOptions.prodis`.
                setAllProdis([...new Set(prodis)]);
                setAllSemesters([...new Set(semesters)].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b)));
                setAllKelas([...new Set(kelas)].sort());

            } catch (error) {
                console.error("Error loading filter options:", error);
            }
        };

        loadFilterOptions();
    }, []);

    // Initial Data Fetch
    const initializeData = useCallback(async () => {
        try {
            setLoading(true);
            const user = getUser();
            setCurrentUser(user);

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

            if (user?.role === "dosen") {
                try {
                    const mkRes = await fetchMataKuliahPengampu(user.id);
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
                kelasName: u.profile?.kelasRef?.nama || u.profile?.kelasId || "-"
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
    const handleSetSearchTerm = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleSetSemesterFilter = (val: string) => {
        setSemesterFilter(val);
        setPage(1);
    };

    const handleSetProdiFilter = (val: string) => {
        setProdiFilter(val);
        setPage(1);
    };

    const handleSetKelasFilter = (val: string) => {
        setKelasFilter(val);
        setPage(1);
    };

    const handleSetFakultasFilter = (val: string) => {
        setFakultasFilter(val);
        setPage(1);
    };

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
        currentUser,

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
