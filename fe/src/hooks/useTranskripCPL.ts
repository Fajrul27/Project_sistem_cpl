import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { fetchMahasiswaList, api, getTranskripCPMK } from "@/lib/api";

export interface TranskripItem {
    cplId: string;
    nilaiAkhir: number;
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
    const { role, userId, loading: roleLoading } = useUserRole();
    const isMahasiswa = role === "mahasiswa";

    const [transkripList, setTranskripList] = useState<TranskripItem[]>([]);
    const [transkripCpmkList, setTranskripCpmkList] = useState<TranskripCpmkItem[]>([]);
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>("");
    const [currentStudent, setCurrentStudent] = useState<Mahasiswa | null>(null);
    const [loading, setLoading] = useState(true);
    const [kaprodiData, setKaprodiData] = useState<KaprodiData | null>(null);
    const [totalCurriculumCpl, setTotalCurriculumCpl] = useState<number>(0);

    const [semester, setSemester] = useState<string>("all");
    const [tahunAjaran, setTahunAjaran] = useState<string>("all");

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

    // Fetch options and settings
    useEffect(() => {
        if (roleLoading) return;
        if (!isMahasiswa) fetchMahasiswaOptions(debouncedSearch);
        fetchSettings();
    }, [debouncedSearch, roleLoading, isMahasiswa]);

    // Fetch data when student/filters change
    useEffect(() => {
        if (selectedMahasiswa) {
            fetchAllData();
        } else {
            // console.log("No selectedMahasiswa, setLoading false");
            setLoading(false);
        }
    }, [selectedMahasiswa, semester, tahunAjaran]);

    const fetchSettings = async () => {
        try {
            const result = await api.get('/settings');
            if (result.data) setSettings(prev => ({ ...prev, ...result.data }));
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchKaprodiData = async (programStudi: string) => {
        try {
            const result = await api.get(`/kaprodi-data/${programStudi}`);
            setKaprodiData(result.data);
        } catch (error) {
            console.error("Error fetching kaprodi data:", error);
        }
    };

    const fetchMahasiswaOptions = async (query: string = "") => {
        try {
            if (query) setSearchLoading(true);
            const response = await fetchMahasiswaList({ q: query, limit: 20 });
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
    };

    const fetchTranskrip = async () => {
        try {
            const params: any = {};
            if (semester !== 'all') params.semester = semester;
            if (tahunAjaran !== 'all') params.tahunAjaran = tahunAjaran;

            const result = await api.get(`/transkrip-cpl/${selectedMahasiswa}`, { params });
            // console.log("FetchTranskrip result:", result);
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

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTranskrip(),
                fetchTranskripCPMK()
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStudentInfo = (m: any) => {
        // console.log("Updating student info:", m);
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
        mahasiswaList,
        loading,
        searchLoading,
        kaprodiData,
        settings,

        // Selections
        selectedMahasiswa,
        setSelectedMahasiswa,
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
        isMahasiswa
    };
}
