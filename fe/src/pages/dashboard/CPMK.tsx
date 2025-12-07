import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, Search, Eye, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { MultiTaxonomySelect } from "@/components/features/MultiTaxonomySelect";
import { Badge } from "@/components/ui/badge";
import { useCPMK, Cpmk } from "@/hooks/useCPMK";
import { LoadingSpinner, LoadingScreen } from "@/components/common/LoadingScreen";

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
            // ... (rest of handleSubmit logic unchanged)
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

    // ... handleEdit, handleDelete, handleViewDetail, resetForm ... 
    // They don't use hook props directly except deleteCpmk which is already destructured.
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

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus CPMK ini?")) return;
        await deleteCpmk(id);
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

    const canEdit = role === "admin" || role === "dosen";

    const hasActiveFilter =
        filters.selectedFakultas !== "all" ||
        filters.selectedProdi !== "all" ||
        filters.mataKuliahFilter !== "all";

    return (
        <DashboardPage
            title="Data CPMK"
            description="Kelola Capaian Pembelajaran Mata Kuliah (CPMK)"
        >
            <div className="space-y-6">
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
                                    <SelectTrigger className="w-full h-8 text-xs">
                                        <SelectValue placeholder="Semua Prodi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Prodi</SelectItem>
                                        {(() => {
                                            let accessibleProdis = prodiList;

                                            // 1. Filter by Role
                                            if (role === 'kaprodi' && profile?.prodiId) {
                                                accessibleProdis = prodiList.filter(p => p.id === profile.prodiId);
                                            } else if (role === 'dosen') {
                                                // Get unique Prodis from taught courses in mataKuliahList
                                                // Note: mataKuliahList is already filtered by backend for Dosen
                                                const taughtProdiIds = new Set(mataKuliahList
                                                    .map(mk => {
                                                        // Handle both nested and flat structures just in case
                                                        const mkData = mk.mataKuliah || mk;
                                                        return mkData.prodiId;
                                                    })
                                                    .filter(Boolean));

                                                if (taughtProdiIds.size > 0) {
                                                    accessibleProdis = prodiList.filter(p => taughtProdiIds.has(p.id));
                                                }
                                            }

                                            // 2. Filter by Selected Fakultas (Admin)
                                            if (role === 'admin' && filters.selectedFakultas !== 'all') {
                                                accessibleProdis = accessibleProdis.filter(p => p.fakultasId === filters.selectedFakultas);
                                            }

                                            return accessibleProdis.map((prodi) => (
                                                <SelectItem key={prodi.id} value={prodi.id}>
                                                    {prodi.nama}
                                                </SelectItem>
                                            ));
                                        })()}
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
                                        <SelectValue placeholder="Semua Mata Kuliah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                        {(() => {
                                            const uniqueMK = mataKuliahList.reduce((acc: any[], current) => {
                                                const id = current.mataKuliah?.id || current.id;
                                                if (!acc.find(item => (item.mataKuliah?.id || item.id) === id)) {
                                                    acc.push(current);
                                                }
                                                return acc;
                                            }, []);

                                            return uniqueMK.map((mk: any) => {
                                                const id = mk.mataKuliah?.id || mk.id;
                                                const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                const semester = mk.mataKuliah?.semester || mk.semester;

                                                return (
                                                    <SelectItem key={id} value={id}>
                                                        {nama} {semester ? `(Semester ${semester})` : ''}
                                                    </SelectItem>
                                                );
                                            });
                                        })()}
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
                                            <Label htmlFor="kodeCpmk">Kode CPMK</Label>
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
                                        <div className="space-y-2">
                                            <Label htmlFor="mataKuliah">Mata Kuliah</Label>
                                            <Select
                                                value={formData.mataKuliahId}
                                                onValueChange={(value) => setFormData({ ...formData, mataKuliahId: value })}
                                                disabled={!!editingCpmk}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Mata Kuliah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {mataKuliahList.map((mk) => {
                                                        const id = mk.mataKuliah?.id || mk.id;
                                                        const kode = mk.mataKuliah?.kodeMk || mk.kodeMk;
                                                        const nama = mk.mataKuliah?.namaMk || mk.namaMk;
                                                        return (
                                                            <SelectItem key={id} value={id}>
                                                                {kode} - {nama}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
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
                    </CardHeader>
                    <CardContent>
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
            </div>
        </DashboardPage >
    );
};

export default CPMKPage;
