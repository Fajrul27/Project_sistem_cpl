import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { fetchMahasiswaList, api, getTranskripCPMK, getTranskripProfil, fetchFakultasList, fetchProdiList } from "@/lib/api";

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

    const [semester, setSemester] = useState<string>("all");

    const [tahunAjaran, setTahunAjaran] = useState<string>("all");

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
                } else {
                    const res = await fetchProdiList();
                    prodiData = res.data || [];
                }

                // Filter prodi for dosen/kaprodi to only show their assigned prodi
                if (isDosen && profile?.prodi?.id) {
                    prodiData = prodiData.filter((p: any) => p.id === profile.prodi.id);
                    // Auto-select dosen's prodi
                    setSelectedProdi(profile.prodi.id);
                }

                setProdiList(prodiData);
            } catch (error) {
                console.error('Error fetching prodi:', error);
                setProdiList([]);
            }
        };
        fetchProdi();
    }, [selectedFakultas, isDosen, profile]);



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

    // Fetch data when student/filters change
    useEffect(() => {
        if (selectedMahasiswa) {
            fetchAllData();
        } else {
            setLoading(false);
        }
    }, [selectedMahasiswa, semester, tahunAjaran]);

    const fetchTranskrip = async () => {
        try {
            const params: any = {};
            if (semester !== 'all') params.semester = semester;
            if (tahunAjaran !== 'all') params.tahunAjaranId = tahunAjaran;

            const result = await api.get(`/transkrip-cpl/${selectedMahasiswa}`, { params });
            setTranskripList(result.data?.transkrip || []);
            setTotalCurriculumCpl(result.data?.summary?.totalCurriculumCpl || 0);
            updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            toast.error("Gagal memuat transkrip CPL");
            setTranskripList([]);
        }
    };

    const fetchTranskripCPMK = async () => {
        try {
            const result = await getTranskripCPMK(selectedMahasiswa, semester, tahunAjaran);
            setTranskripCpmkList(result.data?.transkrip || []);
            if (!transkripList.length) updateStudentInfo(result.data?.mahasiswa);
        } catch (error) {
            console.error("Error fetching transkrip CPMK:", error);
            toast.error("Gagal memuat transkrip CPMK");
            setTranskripCpmkList([]);
        }
    };

    const fetchTranskripProfil = async () => {
        try {
            const result = await getTranskripProfil(selectedMahasiswa, semester, tahunAjaran);
            setProfilLulusanList(result || []);
        } catch (error) {
            console.error("Error fetching transkrip profil:", error);
            setProfilLulusanList([]);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTranskrip(),
                fetchTranskripCPMK(),
                fetchTranskripProfil()
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStudentInfo = (m: any) => {
        if (m) {
            const programStudi = m.prodi?.nama || m.programStudi || "-";
            setCurrentStudent({
                id: m.userId || m.id, // Ensure we use the User ID (which `selectedMahasiswa` is), or fallback to Profile ID
                profile: {
                    namaLengkap: m.namaLengkap,
                    nim: m.nim,
                    programStudi: programStudi,
                    semester: m.semester,
                    tahunMasuk: m.angkatanRef?.tahun || m.tahunMasuk
                }
            });
            if (programStudi && programStudi !== "-") fetchKaprodiData(programStudi);
        }
    };


    // Computed
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
        semester,
        setSemester,
        tahunAjaran,
        setTahunAjaran,
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
