import { useState, useRef, useEffect } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Search,
    Upload,
    Download,
    Trash2,
    Info,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    SlidersHorizontal,
    FileSpreadsheet
} from "lucide-react";
import { useKrs, KrsEntry } from "@/hooks/useKrs";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { toast } from "sonner";
import { useMataKuliah } from "@/hooks/useMataKuliah";
import { useTahunAjaran } from "@/hooks/useTahunAjaran";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ImportResultDialog } from "@/components/common/ImportResultDialog";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { useUserRole } from "@/hooks/useUserRole";
import { api, fetchKelas } from "@/lib/api";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";


const KrsPage = () => {
    const { role } = useUserRole();
    const canManage = role === 'admin';

    const {
        krsList,
        loading,
        pagination,
        filters,
        setFilters,
        setPage,
        importKrs,
        importResult,
        setImportResult,
        deleteKrs,
        createKrs,
        refresh
    } = useKrs();

    const { prodiList, semesterList, mkList, fetchMataKuliah } = useMataKuliah();
    const { tahunAjaranList } = useTahunAjaran();
    const [kelasList, setKelasList] = useState<any[]>([]);

    useEffect(() => {
        const loadKelas = async () => {
            try {
                const res = await fetchKelas();
                if (res.data) setKelasList(res.data);
            } catch (err) {
                console.error("Error loading kelas:", err);
            }
        };
        loadKelas();
        fetchMataKuliah(); // Load MKs for manual form
    }, []);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [searching, setSearching] = useState(filters.q);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedKrs, setSelectedKrs] = useState<KrsEntry | null>(null);

    // Manual add state
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [allMahasiswa, setAllMahasiswa] = useState<any[]>([]);
    const [allMk, setAllMk] = useState<any[]>([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [submittingManual, setSubmittingManual] = useState(false);
    const [manualForm, setManualForm] = useState({
        mahasiswaId: "",
        mataKuliahId: "",
        semesterId: "",
        tahunAjaranId: ""
    });

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const success = await importKrs(file);
        setImporting(false);

        if (e.target) e.target.value = ""; // Reset input
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, q: searching, page: 1 }));
    };

    const fetchAllData = async () => {
        setLoadingAll(true);
        try {
            const [mahasiswaRes, mkRes] = await Promise.all([
                api.get('/users', { params: { role: 'mahasiswa', limit: -1 } }),
                api.get('/mata-kuliah', { params: { limit: -1 } })
            ]);
            setAllMahasiswa(mahasiswaRes.data || []);
            setAllMk(mkRes.data || []);
        } catch (error) {
            console.error("Error fetching all data:", error);
            toast.error("Gagal mengambil data mahasiswa atau mata kuliah");
        } finally {
            setLoadingAll(false);
        }
    };

    const handleOpenAdd = () => {
        setAddDialogOpen(true);
        if (allMahasiswa.length === 0) {
            fetchAllData();
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.mahasiswaId || !manualForm.mataKuliahId || !manualForm.semesterId || !manualForm.tahunAjaranId) {
            toast.error("Semua field harus diisi");
            return;
        }

        setSubmittingManual(true);
        const success = await createKrs(manualForm);
        setSubmittingManual(false);

        if (success) {
            setAddDialogOpen(false);
            setManualForm({
                mahasiswaId: "",
                mataKuliahId: "",
                semesterId: "",
                tahunAjaranId: ""
            });
        }
    };

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Template KRS");

        // Styling for header
        worksheet.columns = [
            { header: "NIM", key: "nim", width: 15 },
            { header: "Nama Mahasiswa", key: "nama", width: 30 },
            { header: "Kode MK", key: "kodeMk", width: 15 },
            { header: "Semester (Angka)", key: "semester", width: 15 },
            { header: "Tahun Ajaran", key: "tahunAjaran", width: 25 },
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Fetch students based on current filters to pre-fill
        let studentsToFill: any[] = [];
        try {
            if (filters.prodiId || filters.kelasId || filters.semesterId) {
                const res = await api.get('/users', {
                    params: {
                        role: 'mahasiswa',
                        prodiId: filters.prodiId,
                        kelasId: filters.kelasId,
                        semester: filters.semesterId ? semesterList.find(s => s.id === filters.semesterId)?.angka : undefined,
                        limit: -1
                    }
                });
                if (res.data) studentsToFill = res.data;
            }
        } catch (err) {
            console.error("Error fetching students for template:", err);
        }

        const currentTahunAjaran = filters.tahunAjaranId
            ? tahunAjaranList.find(t => t.id === filters.tahunAjaranId)?.nama
            : tahunAjaranList.find(t => t.isActive)?.nama;

        if (studentsToFill.length > 0) {
            studentsToFill.forEach(s => {
                worksheet.addRow({
                    nim: s.profile?.nim || "",
                    nama: s.profile?.namaLengkap || "",
                    kodeMk: "",
                    semester: s.profile?.semester || "",
                    tahunAjaran: currentTahunAjaran || ""
                });
            });
            toast.info(`Template berisi ${studentsToFill.length} mahasiswa dari filter aktif.`);
        } else {
            // Add example row if no students found
            worksheet.addRow({
                nim: "2100010001",
                nama: "Ahmad Mahasiswa",
                kodeMk: "MK001",
                semester: "1",
                tahunAjaran: currentTahunAjaran || "2023/2024 Ganjil"
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `Template_KRS_${new Date().getTime()}.xlsx`);
        toast.success("Template berhasil diunduh");
    };

    const confirmDelete = async () => {
        if (!selectedKrs) return;
        await deleteKrs(selectedKrs.id);
        setDeleteDialogOpen(false);
        setSelectedKrs(null);
    };

    return (
        <DashboardPage title="Data KRS Mahasiswa" description="Manajemen Kartu Rencana Studi (KRS) Mahasiswa hasil import Siakad">
            <div className="flex flex-col gap-6">
                {canManage && (
                    <CollapsibleGuide title="Panduan Pengisian & Import KRS">
                        <div className="space-y-3">
                            <p>Data KRS digunakan untuk menentukan mata kuliah apa saja yang muncul di dashboard masing-masing mahasiswa. Gunakan template yang disediakan untuk memastikan format data benar.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li>Format file harus <strong>.xlsx</strong> atau <strong>.xls</strong>.</li>
                                <li>Kolom wajib: <strong>NIM</strong>, <strong>Nama Mahasiswa</strong>, <strong>Kode MK</strong>, <strong>Semester (Angka)</strong>, dan <strong>Tahun Ajaran</strong>.</li>
                                <li>Pastikan NIM Mahasiswa dan Kode Mata Kuliah sudah terdaftar di sistem.</li>
                                <li>Tahun Ajaran harus sesuai dengan nama yang terdaftar di Master Tahun Ajaran.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}

                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Nama/NIM..."
                                className="pl-9 bg-background"
                                value={searching}
                                onChange={(e) => setSearching(e.target.value)}
                            />
                        </form>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={filters.prodiId || filters.tahunAjaranId || filters.semesterId ? "default" : "outline"}
                                    className="gap-2"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filter
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-80 p-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Program Studi</Label>
                                        <SearchableSelect
                                            options={[
                                                { value: "all", label: "Semua Prodi" },
                                                ...prodiList.map(p => ({ value: p.id, label: p.nama }))
                                            ]}
                                            value={filters.prodiId || "all"}
                                            onValueChange={(val) => setFilters(prev => ({ ...prev, prodiId: val === "all" ? "" : val }))}
                                            placeholder="Cari Prodi..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Semester</Label>
                                        <Select
                                            value={filters.semesterId || "all"}
                                            onValueChange={(val) => setFilters(prev => ({ ...prev, semesterId: val === "all" ? "" : val }))}>
                                            <SelectTrigger className="w-full bg-background">
                                                <SelectValue placeholder="Semua Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Semester</SelectItem>
                                                {semesterList.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tahun Ajaran</Label>
                                        <Select
                                            value={filters.tahunAjaranId || "all"}
                                            onValueChange={(val) => setFilters(prev => ({ ...prev, tahunAjaranId: val === "all" ? "" : val }))}>
                                            <SelectTrigger className="w-full bg-background">
                                                <SelectValue placeholder="Tahun Ajaran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Tahun</SelectItem>
                                                {tahunAjaranList?.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kelas</Label>
                                        <Select
                                            value={filters.kelasId || "all"}
                                            onValueChange={(val) => setFilters(prev => ({ ...prev, kelasId: val === "all" ? "" : val }))}>
                                            <SelectTrigger className="w-full bg-background">
                                                <SelectValue placeholder="Semua Kelas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kelas</SelectItem>
                                                {kelasList.map(k => (
                                                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() => setFilters({ prodiId: "", semesterId: "", tahunAjaranId: "", kelasId: "", q: "" })}
                                        disabled={!(filters.prodiId || filters.tahunAjaranId || filters.semesterId || filters.kelasId)}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="flex-1 md:flex-none">
                            <Download className="h-4 w-4 mr-2" />
                            Template
                        </Button>
                        <Button size="sm" onClick={handleOpenAdd} variant="outline" className="flex-1 md:flex-none">
                            Tambah Manual
                        </Button>
                        <Button size="sm" onClick={handleImportClick} disabled={importing} className="flex-1 md:flex-none">
                            {importing ? <LoadingSpinner size="sm" className="mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Import KRS
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                <Card className="shadow-sm border-muted/40">
                    <CardContent className="p-0">
                        <div className="rounded-md">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">NIM</TableHead>
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead>Mata Kuliah</TableHead>
                                        <TableHead className="text-center">SKS</TableHead>
                                        <TableHead className="text-center">Sem.</TableHead>
                                        <TableHead>Tahun Ajaran</TableHead>
                                        <TableHead className="w-[80px] text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                <LoadingSpinner className="mx-auto mb-2" />
                                                Memuat data...
                                            </TableCell>
                                        </TableRow>
                                    ) : krsList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <FileSpreadsheet className="h-10 w-10 mb-2" />
                                                    <p>Tidak ada data KRS ditemukan</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        krsList.map((krs) => (
                                            <TableRow key={krs.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium text-xs font-mono">{krs.mahasiswa.nim}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{krs.mahasiswa.namaLengkap}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{krs.mahasiswa.prodi?.nama}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{krs.mataKuliah.namaMk}</span>
                                                        <span className="text-[10px] text-muted-foreground font-mono uppercase">{krs.mataKuliah.kodeMk}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{krs.mataKuliah.sks}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                                        {krs.semester.angka}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{krs.tahunAjaran.nama}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            setSelectedKrs(krs);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {!loading && krsList.length > 0 && (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{krsList.length}</span> dari <span className="font-medium text-foreground">{pagination.total}</span> data
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="h-8 text-xs"
                            >
                                Sebelumnya
                            </Button>
                            <div className="flex items-center justify-center px-3 h-8 rounded-md bg-muted text-xs font-medium">
                                {pagination.page} / {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="h-8 text-xs"
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus Data KRS"
                description={`Apakah Anda yakin ingin menghapus data KRS ${selectedKrs?.mataKuliah.namaMk} untuk mahasiswa ${selectedKrs?.mahasiswa.namaLengkap}?`}
            />

            {/* Import Result Dialog */}
            <ImportResultDialog
                open={!!importResult}
                onOpenChange={(open) => !open && setImportResult(null)}
                result={importResult}
                title="Hasil Import KRS"
                description="Proses import data KRS telah selesai dengan rincian berikut."
            />

            {/* Manual Add Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Tambah KRS Manual</DialogTitle>
                        <DialogDescription>
                            Pilih mahasiswa dan mata kuliah untuk didaftarkan secara manual.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mahasiswa</label>
                            <SearchableSelect
                                placeholder="Pilih Mahasiswa..."
                                options={allMahasiswa.map(m => ({
                                    value: m.id,
                                    label: `${m.profile?.nim || 'No NIM'} - ${m.profile?.namaLengkap}`
                                }))}
                                value={manualForm.mahasiswaId}
                                onValueChange={(val) => setManualForm(prev => ({ ...prev, mahasiswaId: val }))}
                                disabled={loadingAll}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mata Kuliah</label>
                            <SearchableSelect
                                placeholder="Pilih Mata Kuliah..."
                                options={allMk.map(mk => ({
                                    value: mk.id,
                                    label: `${mk.kodeMk} - ${mk.namaMk} (${mk.sks} SKS)`
                                }))}
                                value={manualForm.mataKuliahId}
                                onValueChange={(val) => setManualForm(prev => ({ ...prev, mataKuliahId: val }))}
                                disabled={loadingAll}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Select
                                    value={manualForm.semesterId}
                                    onValueChange={(val) => setManualForm(prev => ({ ...prev, semesterId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tahun Ajaran</label>
                                <Select
                                    value={manualForm.tahunAjaranId}
                                    onValueChange={(val) => setManualForm(prev => ({ ...prev, tahunAjaranId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tahunAjaranList?.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={submittingManual}>
                                {submittingManual && <LoadingSpinner size="sm" className="mr-2" />}
                                Simpan Data
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ImportResultDialog
                open={!!importResult}
                onOpenChange={(open) => !open && setImportResult(null)}
                result={importResult}
                title="Hasil Import KRS"
                description="Proses import data KRS mahasiswa telah selesai dengan rincian berikut."
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus Data KRS"
                description={`Apakah Anda yakin ingin menghapus data KRS untuk ${selectedKrs?.mahasiswa?.namaLengkap || selectedKrs?.mahasiswa?.nim}? Tindakan ini tidak dapat dibatalkan.`}
            />
        </DashboardPage>
    );
};

export default KrsPage;
