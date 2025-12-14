import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface Student {
    id: string;
    email: string;
    profile?: {
        namaLengkap: string;
        nim: string;
        kelasRef?: {
            id: string;
            nama: string;
        };
    };
}

export interface TeknikPenilaian {
    id: string;
    namaTeknik: string;
    bobotPersentase: number;
}

export interface CPMK {
    id: string;
    kodeCpmk: string;
    teknikPenilaian: TeknikPenilaian[];
    statusValidasi: string;
}

export interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    semester: number;
    prodiId?: string;
    programStudi?: string;
}

export const useNilaiTeknik = () => {
    const [mkList, setMkList] = useState<MataKuliah[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [cpmkList, setCpmkList] = useState<CPMK[]>([]);
    const [kelasList, setKelasList] = useState<any[]>([]);
    const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);

    const [selectedMK, setSelectedMK] = useState<string>("");
    const [selectedKelas, setSelectedKelas] = useState<string>("");
    const [semester, setSemester] = useState<string>("1");
    const [tahunAjaran, setTahunAjaran] = useState<string>(
        `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
    );

    const [grades, setGrades] = useState<Record<string, number>>({}); // key: studentId_teknikId
    const [gradesMetadata, setGradesMetadata] = useState<Record<string, { updatedAt: string }>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Rubrik Dialog State (CPMK Level)
    const [rubrikDialogOpen, setRubrikDialogOpen] = useState(false);
    const [selectedCpmkForRubrik, setSelectedCpmkForRubrik] = useState<any>(null);

    // Rubrik Grading State
    const [gradingDialogOpen, setGradingDialogOpen] = useState(false);
    const [gradingData, setGradingData] = useState<{
        studentId: string;
        teknikId: string;
        cpmkId: string;
        studentName: string;
        teknikName: string;
    } | null>(null);
    const [rubrikGrades, setRubrikGrades] = useState<Record<string, any[]>>({}); // key: studentId_teknikId -> rubrikData array

    useEffect(() => {
        fetchAvailableSemesters();
    }, []);

    // When semester changes, fetch MKs for that semester
    useEffect(() => {
        if (semester) {
            fetchMataKuliahList(semester);
            setSelectedMK("");
            setSelectedKelas("");
            setKelasList([]);
        }
    }, [semester]);

    // When MK changes, fetch classes for that MK
    useEffect(() => {
        if (selectedMK) {
            fetchKelasForMK(selectedMK);
            fetchMKData(selectedMK);
        } else {
            setKelasList([]);
            setSelectedKelas("");
        }
    }, [selectedMK]);

    useEffect(() => {
        if (selectedMK) {
            fetchMKData(selectedMK);
        }
    }, [selectedMK, tahunAjaran]); // Removed semester from here as it triggers MK list reload

    useEffect(() => {
        if (selectedKelas) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedKelas]);

    const fetchKelasForMK = async (mkId: string) => {
        try {
            // 1. Get MK details to know semester and prodi
            const mkResponse = await api.get(`/mata-kuliah/${mkId}`);
            const mk = mkResponse.data;

            if (!mk) return;

            // 2. Fetch students matching MK's semester and prodi
            // We can use the existing /users endpoint with filters
            const params: any = {
                role: 'mahasiswa',
                limit: -1,
                semester: mk.semester
            };

            if (mk.prodiId) {
                params.prodiId = mk.prodiId;
            } else if (mk.programStudi) {
                params.programStudi = mk.programStudi;
            }

            const studentsResponse = await api.get('/users', { params });
            const students = studentsResponse.data || [];

            // 3. Extract unique classes from students
            const uniqueKelasMap = new Map();
            students.forEach((s: any) => {
                if (s.profile?.kelasRef) {
                    uniqueKelasMap.set(s.profile.kelasRef.id, s.profile.kelasRef);
                }
            });

            const classes = Array.from(uniqueKelasMap.values()).sort((a: any, b: any) => a.nama.localeCompare(b.nama));
            setKelasList(classes);

            // Auto-select first class if available
            if (classes.length > 0) {
                setSelectedKelas(classes[0].id);
            } else {
                setSelectedKelas("");
            }
        } catch (error) {
            console.error("Error fetching kelas:", error);
            toast.error("Gagal memuat data kelas");
        }
    };

    const fetchAvailableSemesters = async () => {
        try {
            const result = await api.get('/mata-kuliah/semesters');
            if (result.data) {
                setAvailableSemesters(result.data);
                // If current semester is not in the list and list is not empty, select the first one
                if (result.data.length > 0 && !result.data.includes(parseInt(semester))) {
                    setSemester(result.data[0].toString());
                }
            }
        } catch (error) {
            console.error("Error fetching semesters:", error);
            // Fallback to 1-8 if error
            setAvailableSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
        }
    };

    const fetchStudents = async () => {
        if (!selectedKelas) return;
        try {
            const result = await api.get('/users', {
                params: {
                    role: 'mahasiswa',
                    kelasId: selectedKelas,
                    limit: -1,
                    sortBy: 'nim',
                    sortOrder: 'asc'
                }
            });
            setStudents(result.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal memuat data mahasiswa');
        }
    };

    const fetchMataKuliahList = async (sem: string) => {
        try {
            const result = await api.get('/mata-kuliah', { params: { semester: sem } });
            setMkList(result.data || []);
        } catch (error) {
            console.error('Error fetching mata kuliah:', error);
            toast.error('Gagal memuat daftar mata kuliah');
        }
    };

    const fetchMKData = async (mkId: string) => {
        setLoading(true);
        try {
            // Fetch CPMK & Teknik Penilaian
            const cpmkData = await api.get(`/cpmk/mata-kuliah/${mkId}`);
            setCpmkList(cpmkData.data || []);

            // Fetch existing grades
            try {
                const gradesData = await api.get(`/nilai-teknik/mata-kuliah/${mkId}`, {
                    params: { semester, tahunAjaran }
                });

                const existingGrades: Record<string, number> = {};
                const existingMetadata: Record<string, { updatedAt: string }> = {};
                let maxDate: Date | null = null;

                if (gradesData.data) {
                    gradesData.data.forEach((g: any) => {
                        const key = `${g.mahasiswaId}_${g.teknikPenilaianId}`;
                        existingGrades[key] = g.nilai;
                        if (g.updatedAt) {
                            existingMetadata[key] = { updatedAt: g.updatedAt };
                            const date = new Date(g.updatedAt);
                            if (!maxDate || date > maxDate) {
                                maxDate = date;
                            }
                        }
                    });
                }
                setGrades(existingGrades);
                setGradesMetadata(existingMetadata);
                setLastUpdated(maxDate);
            } catch (err) {
                // console.log("No existing grades or error fetching grades", err);
            }

        } catch (error) {
            console.error('Error fetching MK data:', error);
            toast.error('Gagal memuat data mata kuliah');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = (studentId: string, teknikId: string, value: string) => {
        const numValue = parseFloat(value);
        if (value === '') {
            const newGrades = { ...grades };
            delete newGrades[`${studentId}_${teknikId}`];
            setGrades(newGrades);
            return;
        }

        if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

        setGrades(prev => ({
            ...prev,
            [`${studentId}_${teknikId}`]: numValue
        }));
    };

    const handleOpenGrading = (student: Student, cpmk: CPMK, teknik: TeknikPenilaian) => {
        setGradingData({
            studentId: student.id,
            teknikId: teknik.id,
            cpmkId: cpmk.id,
            studentName: student.profile?.namaLengkap || student.email,
            teknikName: teknik.namaTeknik
        });
        setGradingDialogOpen(true);
    };

    const handleSaveGrading = (nilai: number, rubrikData: any[]) => {
        if (!gradingData) return;

        const key = `${gradingData.studentId}_${gradingData.teknikId}`;

        // Update numeric grade
        setGrades(prev => ({
            ...prev,
            [key]: nilai
        }));

        // Store rubric data for batch save
        setRubrikGrades(prev => ({
            ...prev,
            [key]: rubrikData
        }));
    };

    const handleSave = async () => {
        if (!selectedMK) return;
        setSaving(true);

        try {
            // Convert grades state to array for batch API
            const entries = Object.entries(grades).map(([key, value]) => {
                const [mahasiswaId, teknikPenilaianId] = key.split('_');
                return {
                    mahasiswaId,
                    teknikPenilaianId,
                    mataKuliahId: selectedMK,
                    nilai: value,
                    semester: parseInt(semester),
                    tahunAjaran,
                    rubrikData: rubrikGrades[key] // Include rubric data if available
                };
            });

            if (entries.length === 0) {
                toast.warning("Belum ada nilai yang diinput");
                setSaving(false);
                return;
            }

            const result = await api.post('/nilai-teknik/batch', { entries });

            // Check if there are any errors in the batch response
            if (result.errors && result.errors.length > 0) {
                console.error('Batch errors:', result.errors);

                // Show detailed error messages
                const errorMessages = result.errors.map((err: any) => err.error).join('\n');
                toast.error(`${result.data?.length || 0} nilai berhasil disimpan, ${result.errors.length} gagal`, {
                    description: errorMessages.substring(0, 200) + (errorMessages.length > 200 ? '...' : ''),
                    duration: 8000
                });

                // If ALL entries failed (0 saved), show more prominent error
                if (!result.data || result.data.length === 0) {
                    toast.error('Semua nilai gagal disimpan!', {
                        description: 'Periksa apakah CPMK sudah divalidasi oleh Kaprodi',
                        duration: 10000
                    });
                }
            } else {
                toast.success(`Berhasil menyimpan ${result.data?.length || 0} nilai`);
                setLastUpdated(new Date());
            }

        } catch (error) {
            console.error('Error saving grades:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal menyimpan nilai');
        } finally {
            setSaving(false);
        }
    };

    const downloadTemplate = async () => {
        if (!selectedMK) return;
        try {
            const response = await fetch(`${API_URL}/nilai-teknik/template/${selectedMK}?kelasId=${selectedKelas}&semester=${semester}&tahunAjaran=${encodeURIComponent(tahunAjaran)}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Gagal download template');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const selectedMkData = mkList.find(m => m.id === selectedMK);
            const mkName = selectedMkData ? selectedMkData.namaMk.replace(/[^a-zA-Z0-9]/g, '_') : 'MK';

            a.download = `input_nilai_${mkName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal download template');
        }
    };

    const importExcel = async (file: File): Promise<boolean> => {
        if (!selectedMK) return false;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mataKuliahId', selectedMK);
        formData.append('semester', semester);
        formData.append('tahunAjaran', tahunAjaran);

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/nilai-teknik/import`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Gagal import file');

            toast.success(result.message);
            if (result.errors) {
                result.errors.forEach((err: string) => toast.error(err));
            }

            // Refresh data
            await fetchMKData(selectedMK);
            return true;

        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal import file');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        mkList,
        students,
        cpmkList,
        kelasList,
        availableSemesters,
        selectedMK,
        setSelectedMK,
        selectedKelas,
        setSelectedKelas,
        semester,
        setSemester,
        tahunAjaran,
        setTahunAjaran,

        grades,
        gradesMetadata,
        loading,
        saving,
        lastUpdated,
        rubrikDialogOpen,
        setRubrikDialogOpen,
        selectedCpmkForRubrik,
        setSelectedCpmkForRubrik,
        gradingDialogOpen,
        setGradingDialogOpen,
        gradingData,

        // Actions
        handleGradeChange,
        handleOpenGrading,
        handleSaveGrading,
        handleSave,
        downloadTemplate,
        importExcel
    };
};
