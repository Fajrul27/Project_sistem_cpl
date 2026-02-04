import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, Search, Eye, SlidersHorizontal, Table as TableIcon, List as ListIcon, Download, Upload, Check, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { MultiTaxonomySelect } from "@/components/features/MultiTaxonomySelect";
import { Badge } from "@/components/ui/badge";
import { useCPMK, Cpmk } from "@/hooks/useCPMK";
import { LoadingSpinner, LoadingScreen } from "@/components/common/LoadingScreen";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { CPMKMatrixMapping } from "@/components/features/CPMKMatrixMapping";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequiredLabel } from "@/components/common/RequiredLabel";

const CPMKPage = () => {
    const navigate = useNavigate();
    const { role, profile } = useUserRole();
    const {
        cpmkList,
        mataKuliahList,
        fakultasList,
        prodiList,
        loading,
        createCpmk,
        updateCpmk,
        deleteCpmk,
        filters,
        setSearchTerm,
        setSelectedFakultas,
        setSelectedProdi,
        setMataKuliahFilter,
        resetFilters,
        pagination
    } = useCPMK();

    const [submitting, setSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCpmk, setEditingCpmk] = useState<Cpmk | null>(null);
    const [importing, setImporting] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.selectedProdi !== 'all') queryParams.append('prodiId', filters.selectedProdi);
            if (filters.mataKuliahFilter !== 'all') queryParams.append('mataKuliahId', filters.mataKuliahFilter);

            const API_URL = import.meta.env.VITE_API_URL;
            const url = `${API_URL}/cpmk/export/excel?${queryParams.toString()}`;

            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) throw new Error('Gagal export data');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `cpmk_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success('Data CPMK berhasil diexport');
        } catch (error) {
            toast.error('Gagal export data CPMK');
        }
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setImporting(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const API_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(`${API_URL}/cpmk/import/excel`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Gagal import data');

                toast.success(result.message || 'Data berhasil diimport');
                if (result.errors && result.errors.length > 0) {
                    result.errors.slice(0, 3).forEach((err: string) => toast.error(err));
                }

                window.location.reload();
            } catch (error: any) {
                toast.error(error.message || 'Gagal import data CPMK');
            } finally {
                setImporting(false);
            }
        };
        input.click();
    };
    const [searchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState<"list" | "matrix">("list");
    const [cpmkIdFromUrl, setCpmkIdFromUrl] = useState<string | null>(null);

    // Handle URL params for direct navigation to matrix view
    useEffect(() => {
        const viewParam = searchParams.get("view");
        const mkIdParam = searchParams.get("mkId");
        const cpmkIdParam = searchParams.get("cpmkId");

        if (viewParam === "matrix") {
            setViewMode("matrix");
        }

        if (mkIdParam) {
            setMataKuliahFilter(mkIdParam);
        }

        if (cpmkIdParam) {
            setCpmkIdFromUrl(cpmkIdParam);
        }
    }, [searchParams, setMataKuliahFilter]);

    const [formData, setFormData] = useState({
        kodeCpmk: "",
        deskripsi: "",
        levelTaksonomi: [] as string[],
        mataKuliahId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kodeCpmk || !formData.mataKuliahId) {
            toast.error("Kode CPMK dan Mata Kuliah harus diisi");
            return;
        }

        setSubmitting(true);

        try {
            let success = false;

            if (editingCpmk) {
                success = await updateCpmk(editingCpmk.id, {
                    kodeCpmk: formData.kodeCpmk.trim(),
                    deskripsi: formData.deskripsi.trim() || null,
                    levelTaksonomi: formData.levelTaksonomi.length > 0 ? formData.levelTaksonomi.join(',') : null,
                });
            } else {
                success = await createCpmk({
                    kodeCpmk: formData.kodeCpmk.trim(),
                    deskripsi: formData.deskripsi.trim() || null,
                    levelTaksonomi: formData.levelTaksonomi.length > 0 ? formData.levelTaksonomi.join(',') : null,
                    mataKuliahId: formData.mataKuliahId,
                });
            }

            if (success) {
                resetForm();
                setDialogOpen(false);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (cpmk: Cpmk) => {
        setEditingCpmk(cpmk);
        const levels = cpmk.levelTaksonomi
            ? cpmk.levelTaksonomi.split(',').map(l => l.trim()).filter(Boolean)
            : [];
        setFormData({
            kodeCpmk: cpmk.kodeCpmk,
            deskripsi: cpmk.deskripsi || "",
            levelTaksonomi: levels,
            mataKuliahId: cpmk.mataKuliahId,
        });
        setDialogOpen(true);
    };

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cpmkToDelete, setCpmkToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setCpmkToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (cpmkToDelete) {
            await deleteCpmk(cpmkToDelete);
            setDeleteDialogOpen(false);
            setCpmkToDelete(null);
        }
    };

    const handleViewDetail = (id: string) => {
        navigate(`/dashboard/cpmk/${id}`);
    };

    const resetForm = () => {
        setFormData({
            kodeCpmk: "",
            deskripsi: "",
            levelTaksonomi: [],
            mataKuliahId: "",
        });
        setEditingCpmk(null);
    };

    const canEdit = role === "admin" || role === "kaprodi";

    const hasActiveFilter =
        filters.selectedFakultas !== "all" ||
        filters.selectedProdi !== "all" ||
        filters.mataKuliahFilter !== "all";

    const accessibleProdis = useMemo(() => {
        let prodis = prodiList;

        // 1. Filter by Role
        if (role === 'kaprodi' && profile?.prodiId) {
            prodis = prodiList.filter(p => p.id === profile.prodiId);
        } else if (role === 'dosen') {
            const taughtProdiIds = new Set(mataKuliahList
                .map(mk => {
                    const mkData = mk.mataKuliah || mk;
                    return mkData.prodiId;
                })
                .filter(Boolean));

            if (taughtProdiIds.size > 0) {
                prodis = prodiList.filter(p => taughtProdiIds.has(p.id));
            }
        }

        // 2. Filter by Selected Fakultas (Admin)
        if (role === 'admin' && filters.selectedFakultas !== 'all') {
            prodis = prodis.filter(p => p.fakultasId === filters.selectedFakultas);
        }
        return prodis;
    }, [prodiList, role, profile, mataKuliahList, filters.selectedFakultas]);

    const filteredMataKuliahList = useMemo(() => {
        // If "all" prodi is selected (or none), limit by accessible prodis (which might be limited by Fakultas)
        // If a specific prodi is selected, backend theoretically filters it, but useCPMK logic relies on fetchMataKuliah param.
        // However, if we just changed Fakultas, selectedProdi is 'all', so fetchMataKuliah got 'all'.
        // So we must filter client side.

        let mks = mataKuliahList;

        // If specific Prodi selected, filter by it (double check)
        if (filters.selectedProdi !== 'all') {
            mks = mks.filter(mk => {
                const prodiId = mk.mataKuliah?.prodiId || mk.prodiId;
                return prodiId === filters.selectedProdi;
            });
        } else {
            // Filter by accessible prodis (which accounts for Fakultas)
            const accessibleProdiIds = new Set(accessibleProdis.map(p => p.id));
            mks = mks.filter(mk => {
                const prodiId = mk.mataKuliah?.prodiId || mk.prodiId;
                return accessibleProdiIds.has(prodiId);
            });
        }

        return mks;
    }, [mataKuliahList, filters.selectedProdi, accessibleProdis]);

    // Helper to get unique MKs for dropdowns
    const uniqueMataKuliahOptions = useMemo(() => {
        return filteredMataKuliahList.reduce((acc: any[], current) => {
            const id = current.mataKuliah?.id || current.id;
            if (!acc.find(item => (item.mataKuliah?.id || item.id) === id)) {
                acc.push(current);
            }
            return acc;
        }, []);
    }, [filteredMataKuliahList]);

    return (
        <DashboardPage
            title="Kelola CPMK & Mapping"
            description="Manajemen Capaian Pembelajaran Mata Kuliah dan Mapping ke CPL"
        >
            <div className="space-y-6">

                {/* View Mode Switcher */}
                <div className="flex items-center space-x-4 border-b pb-4">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "matrix")} className="w-[400px]">
                        <TabsList>
                            <TabsTrigger value="list" className="flex items-center gap-2">
                                <ListIcon className="w-4 h-4" /> Daftar CPMK
                            </TabsTrigger>
                            {canEdit && (
                                <TabsTrigger value="matrix" className="flex items-center gap-2">
                                    <TableIcon className="w-4 h-4" /> Matrix Mapping
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </Tabs>
                </div>

                {viewMode === "list" ? (
                    <>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative flex-1 min-w-[220px] max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau deskripsi CPMK..."
                                    value={filters.searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant={hasActiveFilter ? "default" : "outline"}
                                        className="gap-2"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                        Filter
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-80 space-y-4" onClick={(e) => e.stopPropagation()}>
                                    {role === 'admin' && (
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Fakultas</Label>
                                            <Select value={filters.selectedFakultas} onValueChange={setSelectedFakultas}>
                                                <SelectTrigger className="w-full h-8 text-xs">
                                                    <SelectValue placeholder="Pilih Fakultas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fakultasList.map((fak) => (
                                                        <SelectItem key={fak.id} value={fak.id}>
                                                            {fak.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}


                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Program Studi</Label>
                                        <Select value={filters.selectedProdi} onValueChange={setSelectedProdi}>
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Pilih Prodi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accessibleProdis.map((prodi) => (
                                                    <SelectItem key={prodi.id} value={prodi.id}>
                                                        {prodi.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Mata Kuliah</Label>
                                        <Select
                                            value={filters.mataKuliahFilter}
                                            onValueChange={setMataKuliahFilter}
                                        >
                                            <SelectTrigger className="w-full h-8 text-xs">
                                                <SelectValue placeholder="Pilih Mata Kuliah" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {uniqueMataKuliahOptions.map((mk: any) => {
                                                    const id = mk.mataKuliah?.id || mk.id;
                                                    const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                    const semester = mk.mataKuliah?.semester || mk.semester;

                                                    return (
                                                        <SelectItem key={id} value={id}>
                                                            {nama} {semester ? `(Semester ${semester})` : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilters}
                                disabled={
                                    !hasActiveFilter &&
                                    filters.searchTerm === ""
                                }
                            >
                                Reset Filter
                            </Button>
                        </div>

                        <Card>
                            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base md:text-lg">Daftar CPMK</CardTitle>
                                    <CardDescription className="text-xs md:text-sm text-muted-foreground">
                                        Menampilkan <span className="font-medium">{cpmkList.length}</span> dari {pagination.totalItems} CPMK
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <Button size="sm" variant="outline" onClick={handleExport} disabled={loading}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                    {canEdit && (
                                        <Button size="sm" variant="outline" onClick={handleImportClick} disabled={importing}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            {importing ? 'Importing...' : 'Import'}
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    onClick={() => { resetForm(); setDialogOpen(true); }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Tambah CPMK
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>{editingCpmk ? "Edit CPMK" : "Tambah CPMK Baru"}</DialogTitle>
                                                    <DialogDescription>
                                                        Isi form untuk {editingCpmk ? "mengupdate" : "menambahkan"} data CPMK
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <RequiredLabel htmlFor="kodeCpmk" required>Kode CPMK</RequiredLabel>
                                                        <Input
                                                            id="kodeCpmk"
                                                            placeholder="Contoh: CPMK 1"
                                                            value={formData.kodeCpmk}
                                                            onChange={(e) => setFormData({ ...formData, kodeCpmk: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Level Taksonomi (Opsional)</Label>
                                                        <MultiTaxonomySelect
                                                            value={formData.levelTaksonomi.join(',')}
                                                            onChange={(levels) => setFormData({ ...formData, levelTaksonomi: levels })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2 flex flex-col">
                                                        <Label htmlFor="mataKuliah">Mata Kuliah</Label>
                                                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={comboboxOpen}
                                                                    className="w-full justify-between"
                                                                    disabled={!!editingCpmk}
                                                                >
                                                                    {formData.mataKuliahId
                                                                        ? mataKuliahList.find((mk) => (mk.mataKuliah?.id || mk.id) === formData.mataKuliahId)?.mataKuliah?.namaMk ||
                                                                        mataKuliahList.find((mk) => (mk.mataKuliah?.id || mk.id) === formData.mataKuliahId)?.namaMk
                                                                        : "Pilih Mata Kuliah..."}
                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                                <Command>
                                                                    <CommandInput placeholder="Cari mata kuliah..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>Mata kuliah tidak ditemukan.</CommandEmpty>
                                                                        <CommandGroup>
                                                                            {mataKuliahList.map((mk) => {
                                                                                const id = mk.mataKuliah?.id || mk.id;
                                                                                const kode = mk.mataKuliah?.kodeMk || mk.kodeMk;
                                                                                const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={id}
                                                                                        value={`${kode} ${nama}`}
                                                                                        onSelect={() => {
                                                                                            setFormData({ ...formData, mataKuliahId: id === formData.mataKuliahId ? "" : id })
                                                                                            setComboboxOpen(false)
                                                                                        }}
                                                                                    >
                                                                                        <Check
                                                                                            className={cn(
                                                                                                "mr-2 h-4 w-4",
                                                                                                formData.mataKuliahId === id ? "opacity-100" : "opacity-0"
                                                                                            )}
                                                                                        />
                                                                                        {kode} - {nama}
                                                                                    </CommandItem>
                                                                                )
                                                                            })}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="deskripsi">Deskripsi</Label>
                                                        <Textarea
                                                            id="deskripsi"
                                                            placeholder="Deskripsi capaian pembelajaran"
                                                            value={formData.deskripsi}
                                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button type="submit" className="flex-1" disabled={submitting}>
                                                            {submitting ? (
                                                                <>
                                                                    <LoadingSpinner size="sm" className="mr-2" />
                                                                    {editingCpmk ? "Memperbarui..." : "Menyimpan..."}
                                                                </>
                                                            ) : editingCpmk ? "Update" : "Simpan"}
                                                        </Button>
                                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                                            Batal
                                                        </Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">No</TableHead>
                                                <TableHead>Kode CPMK</TableHead>
                                                <TableHead>Level</TableHead>
                                                <TableHead>Deskripsi</TableHead>
                                                <TableHead>Mata Kuliah</TableHead>
                                                <TableHead className="text-center">Mapping CPL</TableHead>
                                                <TableHead className="text-center">Teknik Penilaian</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading && cpmkList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        <LoadingScreen fullScreen={false} message="Memuat data CPMK..." />
                                                    </TableCell>
                                                </TableRow>
                                            ) : cpmkList.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                        Tidak ada data CPMK.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                cpmkList.map((cpmk, index) => (
                                                    <TableRow key={cpmk.id}>
                                                        <TableCell>
                                                            {(pagination.page - 1) * pagination.limit + index + 1}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{cpmk.kodeCpmk}</TableCell>
                                                        <TableCell>
                                                            {cpmk.levelTaksonomi ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {cpmk.levelTaksonomi.split(',').map((level) => (
                                                                        <Badge key={level.trim()} variant="secondary" className="text-xs">
                                                                            {level.trim()}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {cpmk.deskripsi || "-"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div className="font-medium">{cpmk.mataKuliah.kodeMk}</div>
                                                                <div className="text-muted-foreground">{cpmk.mataKuliah.namaMk}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                                                {cpmk.cplMappings?.length || 0}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                                {cpmk.teknikPenilaian?.length || 0}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleViewDetail(cpmk.id)}
                                                                    title="Lihat Detail & Mapping"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {canEdit && (
                                                                    <>
                                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(cpmk)}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/rubrik/${cpmk.id}`)} title="Kelola Rubrik">
                                                                            <SlidersHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(cpmk.id)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            {/* Pagination Controls */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let start = Math.max(1, pagination.page - 2);
                                            if (start + 4 > pagination.totalPages) {
                                                start = Math.max(1, pagination.totalPages - 4);
                                            }
                                            const p = start + i;
                                            if (p > pagination.totalPages) return null;

                                            return (
                                                <Button
                                                    key={p}
                                                    variant={pagination.page === p ? "default" : "outline"}
                                                    size="sm"
                                                    type="button"
                                                    className="w-8 h-8 p-0"
                                                    onClick={() => pagination.setPage(p)}
                                                >
                                                    {p}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                                        disabled={pagination.page === pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </>
                ) : (
                    // MATRIX VIEW
                    <Card>
                        <CardHeader>
                            <CardTitle>Matrix Mapping CPL - CPMK</CardTitle>
                            <CardDescription>
                                Hubungkan CPMK dengan CPL menggunakan tabel matrix di bawah ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {role === 'admin' && (
                                            <div className="space-y-1">
                                                <Label className="text-xs font-medium">Fakultas</Label>
                                                <Select value={filters.selectedFakultas} onValueChange={setSelectedFakultas}>
                                                    <SelectTrigger className="w-full bg-background">
                                                        <SelectValue placeholder="Semua Fakultas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">Semua Fakultas</SelectItem>
                                                        {fakultasList.map((fak) => (
                                                            <SelectItem key={fak.id} value={fak.id}>
                                                                {fak.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <Label className="text-xs font-medium">Program Studi</Label>
                                            <Select value={filters.selectedProdi} onValueChange={setSelectedProdi}>
                                                <SelectTrigger className="w-full bg-background">
                                                    <SelectValue placeholder="Semua Prodi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Prodi</SelectItem>
                                                    {accessibleProdis.map((prodi) => (
                                                        <SelectItem key={prodi.id} value={prodi.id}>
                                                            {prodi.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium">Mata Kuliah</Label>
                                        <Select
                                            value={filters.mataKuliahFilter !== 'all' ? filters.mataKuliahFilter : ""}
                                            onValueChange={(val) => {
                                                setMataKuliahFilter(val);
                                            }}
                                        >
                                            <SelectTrigger className="bg-background">
                                                <SelectValue placeholder="Pilih Mata Kuliah untuk melihat mapping..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {uniqueMataKuliahOptions.map((mk: any) => {
                                                    const id = mk.mataKuliah?.id || mk.id;
                                                    const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                    const semester = mk.mataKuliah?.semester || mk.semester;
                                                    return (
                                                        <SelectItem key={id} value={id}>
                                                            {nama} {semester ? `(Semester ${semester})` : ''}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {filters.mataKuliahFilter !== 'all' ? (
                                    <CPMKMatrixMapping
                                        mataKuliahId={filters.mataKuliahFilter}
                                        prodiId={(() => {
                                            const selectedMK = mataKuliahList.find(mk => (mk.mataKuliah?.id || mk.id) === filters.mataKuliahFilter);
                                            // Handle both structure types (direct or nested)
                                            if (!selectedMK) return undefined;
                                            return selectedMK.mataKuliah?.prodiId || selectedMK.prodiId;
                                        })()}
                                        readOnly={role === 'dosen'}
                                        onBack={cpmkIdFromUrl ? () => navigate(`/dashboard/cpmk/${cpmkIdFromUrl}`) : undefined}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border rounded-lg border-dashed">
                                        <div className="p-4 bg-muted rounded-full mb-4">
                                            <TableIcon className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-lg font-semibold">Pilih Mata Kuliah</h3>
                                        <p className="max-w-sm mt-2">
                                            Silakan pilih mata kulih terlebih dahulu untuk menampilkan tabel matrix mapping CPL-CPMK.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus CPMK"
                description="Apakah Anda yakin ingin menghapus CPMK ini? Tindakan ini tidak dapat dibatalkan."
            />
        </DashboardPage>
    );
};

export default CPMKPage;
