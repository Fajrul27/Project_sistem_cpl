import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useDosenTeachingInfo } from "@/hooks/useDosenTeachingInfo";
import { fetchMahasiswaList, api, getTranskripCPMK, getTranskripProfil, fetchFakultasList, fetchProdiList, fetchMataKuliahPengampu } from "@/lib/api";

export interface TranskripItem {
    cplId: string;
    nilaiAkhir: number;
    huruf: string; // Letter grade from backend
    status: 'tercapai' | 'belum_tercapai';
    cpl: {
        kodeCpl: string;
        deskripsi: string;
        kategori: string;
    };
    mataKuliahList?: {
        id: string;
        kodeMk: string;
        namaMk: string;
    }[];
    mahasiswa?: User['profile'];
    mataKuliah?: {
        id: string;
        kodeMk: string;
        namaMk: string;
    };
}

export interface TranskripCpmkItem {
    id: string;
    kodeCpmk: string;
    deskripsi: string;
    nilai: number;
    courseScore?: number; // Course-level grade
    huruf?: string; // Letter grade
    status: 'tercapai' | 'belum_tercapai';
    mataKuliah: {
        kodeMk: string;
        namaMk: string;
        sks: number;
        programStudi: string;
        semester: number;
        tahunMasuk?: number;
    };
    tahunAjaran: string;
    rowSpan?: number; // For table display
}

export interface ProfilLulusanItem {
    id: string;
    kode: string;
    nama: string;
    deskripsi: string;
    percentage: number;
    status: string;
    cplMappings: any[];
}

export interface Mahasiswa {
    id: string;
    profile: {
        namaLengkap: string;
        nim: string;
        programStudi: string;
        semester: number;
        tahunMasuk?: number;
        angkatanRef?: { tahun: number };
    };
}

export interface KaprodiData {
    namaKaprodi: string;
    nidnKaprodi: string;
}

export interface User {
    id: string;
    profile: {
        namaLengkap: string;
        nim: string;
        prodi?: { nama: string };
        programStudi?: string;
        semester: number;
        tahunMasuk?: number;
        angkatanRef?: { tahun: number };
    };
}

export function useTranskripCPL() {
    const { role, userId, loading: roleLoading, profile } = useUserRole();
    const isMahasiswa = role === "mahasiswa";
    const isDosen = role === "dosen" || role === "kaprodi";

    const [transkripList, setTranskripList] = useState<TranskripItem[]>([]);
    const [transkripCpmkList, setTranskripCpmkList] = useState<TranskripCpmkItem[]>([]);
    const [profilLulusanList, setProfilLulusanList] = useState<ProfilLulusanItem[]>([]);
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>("");
    const [currentStudent, setCurrentStudent] = useState<Mahasiswa | null>(null);
    const [loading, setLoading] = useState(true);
    const [kaprodiData, setKaprodiData] = useState<KaprodiData | null>(null);
    const [totalCurriculumCpl, setTotalCurriculumCpl] = useState<number>(0);

    // Dosen Teaching Info
    const { taughtSemesters } = useDosenTeachingInfo();

    const [semester, setSemester] = useState<string>("all");
    const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);

    // Track the last requested parameters to avoid race conditions
    const lastRequestRef = useRef<{ mhsId: string; semester: string } | null>(null);

    // Filter Filters
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [selectedFakultas, setSelectedFakultas] = useState<string>("");
    const [selectedProdi, setSelectedProdi] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [searchLoading, setSearchLoading] = useState(false);

    const [settings, setSettings] = useState({
        univName: "UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI CILACAP",
        univAddress: "Jl. Kemerdekaan Barat No.17 Kesugihan Kidul, Kec. Kesugihan, Kabupaten Cilacap, Jawa Tengah 53274",
        univContact: "Website : www.unugha.ac.id / e-Mail : kita@unugha.ac.id / Telepon : 0282 695415",
        kaprodiName: "( ........................................................ )",
        kaprodiNip: "",
        logoUrl: "/logo.png"
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initial load and student selection
    useEffect(() => {
        if (isMahasiswa && userId) {
            setSelectedMahasiswa(userId);
        }
    }, [isMahasiswa, userId]);

    // Initial data fetch (Filters only)
    useEffect(() => {
        fetchFilters();
    }, []);

    const fetchFilters = async () => {
        try {
            const fakRef = await fetchFakultasList();
            setFakultasList(fakRef.data || []);

            // Role-based Fakultas initialization
            if (!roleLoading && role !== "admin" && profile) {
                const fId = profile.fakultasId || (profile.prodi as any)?.fakultasId;
                if (fId) {
                    setSelectedFakultas(fId);
                }
            }

            const taRes = await api.get('/references/tahun-ajaran');
            setTahunAjaranList(taRes.data || []);
        } catch (e) { console.error(e); }
    };

    // Watch Fakultas change to update Prodi list
    useEffect(() => {
        const fetchProdi = async () => {
            try {
                let prodiData = [];
                if (selectedFakultas && selectedFakultas !== 'all') {
                    const res = await fetchProdiList(selectedFakultas);
                    prodiData = res.data || [];
                } else if (!selectedFakultas || selectedFakultas === 'all') {
                    const res = await fetchProdiList();
                    prodiData = res.data || [];
                }

                // Filter prodi based on role
                if (role !== "admin" && profile) {
                    let allowedProdiIds = new Set<string>();
                    if (profile.prodiId) allowedProdiIds.add(profile.prodiId);

                    // For lecturers, also include prodis from courses they teach
                    if (role === 'dosen') {
                        try {
                            const mkRes = await fetchMataKuliahPengampu(userId!);
                            const mkProdis = mkRes.data?.map((mk: any) => mk.mataKuliah?.prodiId || mk.prodiId).filter(Boolean);
                            mkProdis?.forEach((id: string) => allowedProdiIds.add(id));
                        } catch (e) { console.error("Error fetching taught prodis:", e); }
                    }

                    if (allowedProdiIds.size > 0) {
                        prodiData = prodiData.filter((p: any) => allowedProdiIds.has(p.id));
                    }

                    // Force select the user's prodi if not already set or if it's currently 'all'
                    if (!selectedProdi || selectedProdi === 'all') {
                        if (profile.prodiId) setSelectedProdi(profile.prodiId);
                        else if (prodiData.length > 0) setSelectedProdi(prodiData[0].id);
                    }
                }

                setProdiList(prodiData);
            } catch (error) {
                console.error('Error fetching prodi:', error);
                setProdiList([]);
            }
        };
        if (!roleLoading) {
            fetchProdi();
        }
    }, [selectedFakultas, role, profile, roleLoading]);



    const fetchKaprodiData = async (programStudi: string) => {
        try {
            const result = await api.get(`/kaprodi-data/${programStudi}`);
            setKaprodiData(result.data);
        } catch (error) {
            console.error("Error fetching kaprodi data:", error);
        }
    };

    const fetchMahasiswaOptions = useCallback(async (query: string = "") => {
        try {
            if (query) setSearchLoading(true);
            const params: any = {
                q: query,
                limit: 50, // Increased limit to show more students initially
                sortBy: 'nama', // Sort by name for better usability
                sortOrder: 'asc'
            };
            if (selectedFakultas !== 'all') params.fakultasId = selectedFakultas;
            if (selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (selectedSemester !== 'all') params.semester = selectedSemester;

            const response = await fetchMahasiswaList(params);
            const users = response?.data || [];
            const mapped: Mahasiswa[] = users
                .filter((u: User) => u.profile && u.profile.nim)
                .map((u: User) => ({
                    id: u.id,
                    profile: {
                        namaLengkap: u.profile.namaLengkap,
                        nim: u.profile.nim,
                        programStudi: u.profile.prodi?.nama || u.profile.programStudi,
                        semester: u.profile.semester,
                        tahunMasuk: u.profile.angkatanRef?.tahun || u.profile.tahunMasuk
                    }
                }));
            setMahasiswaList(mapped);
        } catch (error) {
            console.error("Error fetching mahasiswa:", error);
            toast.error("Gagal memuat daftar mahasiswa");
        } finally {
            if (query) setSearchLoading(false);
        }
    }, [selectedFakultas, selectedProdi, selectedSemester]);

    // Fetch students when search or filters change
    useEffect(() => {
        if (roleLoading) return;
        if (!isMahasiswa) fetchMahasiswaOptions(debouncedSearch);
    }, [debouncedSearch, roleLoading, isMahasiswa, fetchMahasiswaOptions]);

    // Watch for student selection changes
    useEffect(() => {
        if (selectedMahasiswa) {
            // Find student profile to get current semester (even if admin)
            const mhsProfile = mahasiswaList.find(m => m.id === selectedMahasiswa);
            const currentSem = (isMahasiswa ? profile?.semester : mhsProfile?.profile?.semester)?.toString() || "all";

            setSemester(currentSem);
            fetchAllData(selectedMahasiswa, currentSem);
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa, isMahasiswa, profile?.id, profile?.semester]); // Using profile?.id and semester to be safer

    // Watch for manual semester filter changes
    useEffect(() => {
        // Skip if student not selected or if this is the initial set already handled by fetchAllData
        if (selectedMahasiswa) {
            // Check if this semester is different from what we last requested
            if (!lastRequestRef.current ||
                lastRequestRef.current.mhsId !== selectedMahasiswa ||
                lastRequestRef.current.semester !== semester) {
                // Fetch ONLY CPMK when semester changes (CPL/Profil are cumulative)
                fetchTranskripCPMK(selectedMahasiswa, semester);
            }
        }
    }, [semester, selectedMahasiswa]);

    const fetchTranskrip = async (mhsId: string = selectedMahasiswa, targetSemester: string = semester) => {
        try {
            const params: any = {};
            if (targetSemester && targetSemester !== 'all') params.semester = targetSemester;

            const result = await api.get(`/transkrip-cpl/${mhsId}`, { params });
            setTranskripList(result.data?.transkrip || []);
            setTotalCurriculumCpl(result.data?.summary?.totalCurriculumCpl || 0);
            return result.data?.mahasiswa;
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            toast.error("Gagal memuat transkrip CPL");
            setTranskripList([]);
            return null;
        }
    };

    const fetchTranskripCPMK = async (mhsId: string = selectedMahasiswa, targetSemester: string = semester) => {
        // Update tracking ref
        lastRequestRef.current = { mhsId, semester: targetSemester };
        const currentReq = lastRequestRef.current;

        try {
            const result = await getTranskripCPMK(mhsId, targetSemester);

            // Only update if this is still the latest request
            if (lastRequestRef.current === currentReq) {
                setTranskripCpmkList(result.data?.transkrip || []);
                return result.data?.mahasiswa;
            }
            return null;
        } catch (error) {
            console.error("Error fetching transkrip CPMK:", error);
            if (lastRequestRef.current === currentReq) {
                toast.error("Gagal memuat transkrip CPMK");
                setTranskripCpmkList([]);
            }
            return null;
        }
    };

    const fetchTranskripProfil = async (mhsId: string = selectedMahasiswa, targetSemester: string = semester) => {
        try {
            const result = await getTranskripProfil(mhsId, targetSemester);
            setProfilLulusanList(result || []);
        } catch (error) {
            console.error("Error fetching transkrip profil:", error);
            setProfilLulusanList([]);
        }
    };

    const fetchAllData = async (mhsId: string = selectedMahasiswa, sem: string = semester) => {
        setLoading(true);
        try {
            const [mCpl, mCpmk] = await Promise.all([
                fetchTranskrip(mhsId, "all"),     // CPL always cumulative
                fetchTranskripCPMK(mhsId, sem),  // CPMK uses filter (default to current)
                fetchTranskripProfil(mhsId, "all") // Profil always cumulative
            ]);

            const m = mCpmk || mCpl;
            if (m) updateStudentInfo(m, false);
        } catch (error) {
            console.error("Error fetching all data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStudentInfo = (m: any, shouldUpdateSemester: boolean = true) => {
        if (m) {
            const programStudi = m.prodi?.nama || m.programStudi || "-";
            setCurrentStudent({
                id: m.userId || m.id,
                profile: {
                    namaLengkap: m.namaLengkap,
                    nim: m.nim,
                    programStudi: programStudi,
                    semester: m.semester,
                    tahunMasuk: m.angkatanRef?.tahun || m.tahunMasuk
                }
            });

            // Only update semester if explicitly requested (usually on initialization)
            if (shouldUpdateSemester && m.semester) {
                setSemester(m.semester.toString());
            }

            if (programStudi && programStudi !== "-") fetchKaprodiData(programStudi);
        }
    };


    // Computed
    const semesterList = (role === 'dosen' && taughtSemesters.length > 0)
        ? taughtSemesters.map(s => ({ id: s.toString(), nama: `Semester ${s}` }))
        : [1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ id: s.toString(), nama: `Semester ${s}` }));

    const selectedStudent = currentStudent || mahasiswaList.find(m => m.id === selectedMahasiswa);
    const validTranskripList = Array.isArray(transkripList) ? transkripList : [];
    const avgScore = validTranskripList.length > 0
        ? validTranskripList.reduce((sum, item) => sum + item.nilaiAkhir, 0) / validTranskripList.length
        : 0;
    const completedCPL = validTranskripList.filter(item => item.status === 'tercapai').length;

    return {
        // State
        transkripList,
        transkripCpmkList,
        profilLulusanList,
        mahasiswaList,
        loading,
        searchLoading,
        kaprodiData,
        tahunAjaranList,
        settings,

        // Selections
        selectedMahasiswa,
        setSelectedMahasiswa,
        selectedFakultas,
        setSelectedFakultas,
        selectedProdi,
        setSelectedProdi,
        selectedSemester,
        setSelectedSemester,
        fakultasList,
        prodiList,
        semesterList,
        semester,
        setSemester,
        searchQuery,
        setSearchQuery,

        // Computed
        selectedStudent,
        validTranskripList,
        avgScore,
        completedCPL,
        totalCurriculumCpl,

        // Roles
        isMahasiswa,
        isDosen
    };
}
