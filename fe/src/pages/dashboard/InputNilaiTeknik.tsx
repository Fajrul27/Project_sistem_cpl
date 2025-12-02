import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Save, FileText, AlertCircle, Upload, CheckCircle2, XCircle, Settings } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RubrikDialog } from "@/components/RubrikDialog";
import { RubrikGradingDialog } from "@/components/RubrikGradingDialog";
import { Gavel } from "lucide-react";

import { api, fetchKelas } from "@/lib/api-client";

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Student {
    id: string;
    email: string;
    profile?: {
        namaLengkap: string;
        nim: string;
    };
}

interface TeknikPenilaian {
    id: string;
    namaTeknik: string;
    bobotPersentase: number;
}

interface CPMK {
    id: string;
    kodeCpmk: string;
    teknikPenilaian: TeknikPenilaian[];
    statusValidasi: string;
}

interface MataKuliah {
    id: string;
    kodeMk: string;
    namaMk: string;
    semester: number;
}

const InputNilaiTeknikPage = () => {
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
        fetchInitialData();
        fetchAvailableSemesters();
    }, []);

    useEffect(() => {
        fetchInitialData();
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

    const fetchInitialData = async () => {
        // No longer fetching initial kelas list
    };

    const fetchKelasForMK = async (mkId: string) => {
        try {
            const result = await api.get(`/mata-kuliah/${mkId}/kelas`);
            setKelasList(result.data || []);
            // Auto-select first class if available
            if (result.data && result.data.length > 0) {
                setSelectedKelas(result.data[0].id);
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
                    mataKuliahId: selectedMK,
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
                let maxDate: Date | null = null;

                if (gradesData.data) {
                    gradesData.data.forEach((g: any) => {
                        existingGrades[`${g.mahasiswaId}_${g.teknikPenilaianId}`] = g.nilai;

                        if (g.updatedAt) {
                            const date = new Date(g.updatedAt);
                            if (!maxDate || date > maxDate) {
                                maxDate = date;
                            }
                        }
                    });
                }
                setGrades(existingGrades);
                setLastUpdated(maxDate);
            } catch (err) {
                // Ignore error if no grades found or other issue, just log
                console.log("No existing grades or error fetching grades", err);
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

    const handleDownloadTemplate = async () => {
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
            a.download = `Template_Nilai_MK.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Gagal download template');
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedMK) return;

        const file = e.target.files[0];
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

        } catch (error) {
            console.error('Import error:', error);
            toast.error(error instanceof Error ? error.message : 'Gagal import file');
        } finally {
            setLoading(false);
            // Reset file input
            e.target.value = '';
        }
    };



    return (
        <DashboardPage title="Input Nilai Teknik Penilaian" description="Input nilai berdasarkan teknik penilaian (Tugas, Kuis, dll)">
            <div className="space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Data</CardTitle>
                        <CardDescription>Pilih Mata Kuliah dan Periode Akademik</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSemesters.length > 0 ? (
                                        availableSemesters.map(s => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))
                                    ) : (
                                        [1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Mata Kuliah</Label>
                            <Select value={selectedMK} onValueChange={setSelectedMK}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mkList.map(mk => (
                                        <SelectItem key={mk.id} value={mk.id}>{mk.kodeMk} - {mk.namaMk}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Kelas</Label>
                            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kelasList.map(k => (
                                        <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tahun Ajaran</Label>
                            <Input
                                value={tahunAjaran}
                                onChange={e => setTahunAjaran(e.target.value)}
                                placeholder="2024/2025"
                            />
                        </div>
                    </CardContent>
                </Card>

                {selectedMK && selectedKelas && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Form Input Nilai</CardTitle>
                                <CardDescription>Masukkan nilai untuk setiap mahasiswa per teknik penilaian</CardDescription>
                                {lastUpdated && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Terakhir disimpan: {lastUpdated.toLocaleString('id-ID')}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleDownloadTemplate} disabled={loading || !selectedMK}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Download Template
                                </Button>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        onChange={handleImportExcel}
                                        disabled={loading || !selectedMK}
                                    />
                                    <Button variant="outline" disabled={loading || !selectedMK}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Import Excel
                                    </Button>
                                </div>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Nilai
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : cpmkList.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada CPMK atau Teknik Penilaian untuk mata kuliah ini.
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada mahasiswa di kelas ini.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead rowSpan={2} className="w-[200px]">Mahasiswa</TableHead>
                                            {cpmkList.map(cpmk => (
                                                <TableHead
                                                    key={cpmk.id}
                                                    colSpan={cpmk.teknikPenilaian.length}
                                                    className="text-center border-l border-r bg-muted/50"
                                                >
                                                    <div className="flex flex-col items-center gap-2 py-2">
                                                        <span className="font-semibold">{cpmk.kodeCpmk}</span>

                                                        {/* Rubrik Button - CPMK Level */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-[10px] px-2 border-primary/40 hover:bg-primary/10"
                                                            onClick={() => {
                                                                setSelectedCpmkForRubrik(cpmk);
                                                                setRubrikDialogOpen(true);
                                                            }}
                                                        >
                                                            <Settings className="h-3 w-3 mr-1" />
                                                            Rubrik
                                                        </Button>

                                                        {cpmk.statusValidasi === 'validated' || cpmk.statusValidasi === 'active' ? (
                                                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-[10px] h-5 px-1">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Valid
                                                            </Badge>
                                                        ) : (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Badge variant="destructive" className="text-[10px] h-5 px-1">
                                                                            <XCircle className="w-3 h-3 mr-1" /> Draft
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>CPMK belum divalidasi Kaprodi</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                        <TableRow>
                                            {cpmkList.map(cpmk =>
                                                cpmk.teknikPenilaian.length > 0 ? (
                                                    cpmk.teknikPenilaian.map(teknik => (
                                                        <TableHead key={teknik.id} className="text-center min-w-[100px] border-l border-r text-xs">
                                                            <div className="flex flex-col items-center gap-0.5 py-1">
                                                                <div className="font-medium">{teknik.namaTeknik}</div>
                                                                <div className="text-[10px] text-muted-foreground">({teknik.bobotPersentase}%)</div>
                                                            </div>
                                                        </TableHead>
                                                    ))
                                                ) : (
                                                    <TableHead key={`empty-${cpmk.id}`} className="text-center text-xs italic text-muted-foreground">
                                                        No Teknik
                                                    </TableHead>
                                                )
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">
                                                    <div className="text-sm">{student.profile?.namaLengkap || student.email}</div>
                                                    <div className="text-xs text-muted-foreground">{student.profile?.nim}</div>
                                                </TableCell>
                                                {cpmkList.map(cpmk =>
                                                    cpmk.teknikPenilaian.length > 0 ? (
                                                        cpmk.teknikPenilaian.map(teknik => (
                                                            <TableCell key={`${student.id}-${teknik.id}`} className="border-l border-r p-2">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    className="h-8 text-center"
                                                                    placeholder="0"
                                                                    value={grades[`${student.id}_${teknik.id}`] ?? ""}
                                                                    onChange={e => handleGradeChange(student.id, teknik.id, e.target.value)}
                                                                    disabled={cpmk.statusValidasi !== 'validated' && cpmk.statusValidasi !== 'active'}
                                                                    title={cpmk.statusValidasi !== 'validated' && cpmk.statusValidasi !== 'active' ? "CPMK belum divalidasi" : ""}
                                                                />
                                                                {(cpmk.statusValidasi === 'validated' || cpmk.statusValidasi === 'active') && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 ml-1 text-muted-foreground hover:text-primary"
                                                                        title="Nilai dengan Rubrik"
                                                                        onClick={() => handleOpenGrading(student, cpmk, teknik)}
                                                                    >
                                                                        <Gavel className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        ))
                                                    ) : (
                                                        <TableCell key={`empty-cell-${cpmk.id}`} className="bg-muted/20" />
                                                    )
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Rubrik Dialog - CPMK Level */}
            {
                selectedCpmkForRubrik && (
                    <RubrikDialog
                        open={rubrikDialogOpen}
                        onOpenChange={setRubrikDialogOpen}
                        cpmkId={selectedCpmkForRubrik.id}
                        cpmkInfo={selectedCpmkForRubrik}
                    />
                )
            }

            {/* Rubrik Grading Dialog */}
            {
                gradingData && (
                    <RubrikGradingDialog
                        open={gradingDialogOpen}
                        onOpenChange={setGradingDialogOpen}
                        cpmkId={gradingData.cpmkId}
                        mahasiswaName={gradingData.studentName}
                        teknikName={gradingData.teknikName}
                        onSave={handleSaveGrading}
                    />
                )
            }
        </DashboardPage >
    );
};

export default InputNilaiTeknikPage;
