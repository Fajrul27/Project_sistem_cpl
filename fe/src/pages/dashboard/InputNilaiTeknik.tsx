import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Save, FileText, AlertCircle, Upload } from "lucide-react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { api } from "@/lib/api-client";

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

    const [selectedMK, setSelectedMK] = useState<string>("");
    const [semester, setSemester] = useState<string>("1");
    const [tahunAjaran, setTahunAjaran] = useState<string>(
        `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
    );

    const [grades, setGrades] = useState<Record<string, number>>({}); // key: studentId_teknikId
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        fetchMataKuliahList();
        // Reset selected MK when semester changes
        setSelectedMK("");
    }, [semester]);

    useEffect(() => {
        if (selectedMK) {
            fetchMKData(selectedMK);
        }
    }, [selectedMK, tahunAjaran]); // Removed semester from here as it triggers MK list reload

    const fetchStudents = async () => {
        try {
            const result = await api.get('/users', { params: { role: 'mahasiswa' } });
            setStudents(result.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal memuat data mahasiswa');
        }
    };

    const fetchMataKuliahList = async () => {
        try {
            const result = await api.get('/mata-kuliah', { params: { semester } });
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
                if (gradesData.data) {
                    gradesData.data.forEach((g: any) => {
                        existingGrades[`${g.mahasiswaId}_${g.teknikPenilaianId}`] = g.nilai;
                    });
                }
                setGrades(existingGrades);
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
                    tahunAjaran
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
            const response = await fetch(`${API_URL}/nilai-teknik/template/${selectedMK}`, {
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <Label>Semester</Label>
                            <Select value={semester} onValueChange={setSemester}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                        <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
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

                {selectedMK && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Form Input Nilai</CardTitle>
                                <CardDescription>Masukkan nilai untuk setiap mahasiswa per teknik penilaian</CardDescription>
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
                                                    {cpmk.kodeCpmk}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                        <TableRow>
                                            {cpmkList.map(cpmk =>
                                                cpmk.teknikPenilaian.length > 0 ? (
                                                    cpmk.teknikPenilaian.map(teknik => (
                                                        <TableHead key={teknik.id} className="text-center min-w-[100px] border-l border-r text-xs">
                                                            {teknik.namaTeknik} <br />
                                                            <span className="text-muted-foreground">({teknik.bobotPersentase}%)</span>
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
                                                                />
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
        </DashboardPage>
    );
};

export default InputNilaiTeknikPage;
