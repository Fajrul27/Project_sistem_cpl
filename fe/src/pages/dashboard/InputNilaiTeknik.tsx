import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, FileText, Upload, CheckCircle2, XCircle, Settings, Gavel } from "lucide-react";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RubrikDialog } from "@/components/features/RubrikDialog";
import { RubrikGradingDialog } from "@/components/features/RubrikGradingDialog";
import { useNilaiTeknik } from "@/hooks/useNilaiTeknik";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";
import { useEffect } from "react";

const InputNilaiTeknikPage = () => {
    const {
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
        handleGradeChange,
        handleOpenGrading,
        handleSaveGrading,
        handleSave,
        downloadTemplate,
        importExcel
    } = useNilaiTeknik();

    const { tahunAjaranList, activeTahunAjaran } = useTahunAjaran();

    // Set default active Tahun Ajaran
    useEffect(() => {
        if (activeTahunAjaran && !tahunAjaran) {
            setTahunAjaran(activeTahunAjaran.id);
        }
    }, [activeTahunAjaran]);

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const success = await importExcel(file);
        if (success) {
            e.target.value = ''; // Reset input on success
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
                            <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tahun Ajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tahunAjaranList.map(ta => (
                                        <SelectItem key={ta.id} value={ta.id}>{ta.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                <Button variant="outline" onClick={downloadTemplate} disabled={loading || !selectedMK}>
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
                                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Nilai
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner size="lg" />
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
                                <div className="overflow-x-auto">
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
                                </div>
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

