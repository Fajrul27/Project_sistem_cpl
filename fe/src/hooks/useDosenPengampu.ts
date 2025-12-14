import { useState, useEffect, useCallback } from "react";
import { api, fetchKelas, fetchProdiList, fetchSemesters, fetchFakultasList } from "@/lib/api";
import { toast } from "sonner";

export interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    sks: number;
    semester: number;
    programStudi: string;
}

export interface Dosen {
    id: string;
    email: string;
    profile: {
        namaLengkap: string;
        nip: string;
        nidn: string;
    };
}

export interface Pengampu {
    id: string;
    dosenId: string;
    mataKuliahId: string;
    dosen: {
        userId: string;
        namaLengkap: string;
        nip: string;
        nidn: string;
        user: {
            email: string;
        };
    };
    kelas?: {
        id: string;
        nama: string;
    };
}

export function useDosenPengampu() {
    const [loading, setLoading] = useState(true);
    const [loadingPengampu, setLoadingPengampu] = useState(false);
    const [adding, setAdding] = useState(false);

    // Data
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
    const [dosenList, setDosenList] = useState<Dosen[]>([]);
    const [pengampuList, setPengampuList] = useState<Pengampu[]>([]);
    const [fakultasList, setFakultasList] = useState<any[]>([]);
    const [prodiList, setProdiList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);

    // Filters / Selection
    const [selectedFakultas, setSelectedFakultas] = useState<string>("all");
    const [selectedProdi, setSelectedProdi] = useState<string>("all");
    const [selectedSemester, setSelectedSemester] = useState<string>("all");
    const [selectedMk, setSelectedMk] = useState<string>("");
    const [selectedDosen, setSelectedDosen] = useState<string>("");


    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            const [dosenRes, semesterRes, fakultasRes] = await Promise.all([
                api.get('/users?role=dosen&limit=-1'),
                fetchSemesters(),
                fetchFakultasList()
            ]);

            setDosenList(dosenRes.data || []);
            setSemesterList(semesterRes.data || []);
            setFakultasList(fakultasRes.data || []);
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProdi = useCallback(async () => {
        try {
            const fakultasId = selectedFakultas !== 'all' ? selectedFakultas : undefined;
            const res = await fetchProdiList(fakultasId);
            setProdiList(res.data || []);

            // Reset selected Prodi if not valid for current fakultas (unless 'all')
            if (selectedProdi !== 'all') {
                const exists = (res.data || []).find((p: any) => p.id === selectedProdi);
                if (!exists) setSelectedProdi("all");
            }
        } catch (error) {
            console.error("Error fetching prodi:", error);
        }
    }, [selectedFakultas, selectedProdi]);

    const fetchMataKuliah = useCallback(async () => {
        try {
            const params: any = {};
            if (selectedProdi && selectedProdi !== 'all') params.prodiId = selectedProdi;
            if (selectedSemester && selectedSemester !== 'all') params.semester = selectedSemester;

            const mkRes = await api.get('/mata-kuliah', { params });
            setMataKuliahList(mkRes.data || []);

            if (selectedMk) {
                const exists = (mkRes.data || []).find((mk: any) => mk.id === selectedMk);
                if (!exists) setSelectedMk("");
            }
        } catch (error) {
            console.error("Error fetching mata kuliah:", error);
        }
    }, [selectedProdi, selectedSemester, selectedMk]);

    const fetchPengampu = useCallback(async (mkId: string) => {
        try {
            setLoadingPengampu(true);
            const response = await api.get(`/mata-kuliah-pengampu/mata-kuliah/${mkId}`);
            setPengampuList(response.data || []);
        } catch (error) {
            console.error("Error fetching pengampu:", error);
            toast.error("Gagal memuat data pengampu");
        } finally {
            setLoadingPengampu(false);
        }
    }, []);

    // Effect for Initial Load
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Effect for Prodi
    useEffect(() => {
        fetchProdi();
    }, [selectedFakultas, fetchProdi]);

    // Effect for MK
    useEffect(() => {
        fetchMataKuliah();
    }, [selectedProdi, selectedSemester, fetchMataKuliah]);

    // Effect for Pengampu
    useEffect(() => {
        if (selectedMk) {
            fetchPengampu(selectedMk);
        } else {
            setPengampuList([]);
        }
    }, [selectedMk, fetchPengampu]);


    const handleAddPengampu = async () => {
        if (!selectedMk || !selectedDosen) {
            toast.error("Pilih mata kuliah dan dosen terlebih dahulu");
            return;
        }

        if (pengampuList.some(p => p.dosenId === selectedDosen)) {
            toast.error("Dosen sudah menjadi pengampu mata kuliah ini");
            return;
        }

        try {
            setAdding(true);
            await api.post('/mata-kuliah-pengampu', {
                mataKuliahId: selectedMk,
                dosenId: selectedDosen,
                kelasId: null
            });

            toast.success("Berhasil menambahkan dosen pengampu");
            fetchPengampu(selectedMk);
            setSelectedDosen("");
        } catch (error: any) {
            console.error("Error adding pengampu:", error);
            toast.error(error.message || "Gagal menambahkan pengampu");
        } finally {
            setAdding(false);
        }
    };

    const handleDeletePengampu = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengampu ini?")) return;
        try {
            await api.delete(`/mata-kuliah-pengampu/${id}`);
            toast.success("Pengampu berhasil dihapus");
            fetchPengampu(selectedMk);
        } catch (error) {
            console.error("Error deleting pengampu:", error);
            toast.error("Gagal menghapus pengampu");
        }
    };

    return {
        // Data
        mataKuliahList,
        dosenList,
        pengampuList,
        fakultasList,
        prodiList,
        semesterList,
        loading,
        loadingPengampu,
        adding,

        // Selection States
        selectedFakultas,
        selectedProdi,
        selectedSemester,
        selectedMk,
        selectedDosen,

        // Setters
        setSelectedFakultas,
        setSelectedProdi,
        setSelectedSemester,
        setSelectedMk,
        setSelectedDosen,

        // Actions
        handleAddPengampu,
        handleDeletePengampu
    };
}
