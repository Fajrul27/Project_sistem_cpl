import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermission } from "@/contexts/PermissionContext";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, Briefcase, Search, SlidersHorizontal, Eye } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useProfilLulusan, ProfilLulusan } from "@/hooks/useProfilLulusan";

export default function ProfilLulusanPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, profile } = useUserRole();
    const {
        profilList,
        prodiList,
        fakultasList,
        cplList,
        kurikulumList,
        selectedFakultas,
        setSelectedFakultas,
        selectedProdi,
        setSelectedProdi,
        loading,
        createProfil,
        updateProfil,
        deleteProfil,
        pagination,
        searchTerm,
        setSearchTerm
    } = useProfilLulusan();

    // Restore state from navigation
    useEffect(() => {
        if (location.state?.filters) {
            const f = location.state.filters;
            if (f.page) pagination.setPage(f.page);
            if (f.searchTerm) setSearchTerm(f.searchTerm);
            if (f.fakultasId) setSelectedFakultas(f.fakultasId);
            if (f.prodiId) setSelectedProdi(f.prodiId);
        }
    }, [location.state]); // Run when location state changes (usually on mount)

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProfilLulusan | null>(null);
    // const [selectedCpls, setSelectedCpls] = useState<string[]>([]); // Removed CPL mapping

    // Form State
    const [formData, setFormData] = useState({
        kode: "",
        nama: "",
        deskripsi: "",
        fakultasId: "",
        prodiId: "",
        kurikulumId: "",
        targetKetercapaian: ""
    });

    const [formProdiList, setFormProdiList] = useState<{ id: string; nama: string }[]>([]);

    // Fetch Prodi list for form when fakultasId changes
    useEffect(() => {
        if (formData.fakultasId) {
            const fetchFormProdi = async () => {
                try {
                    const res = await api.get(`/prodi?fakultasId=${formData.fakultasId}`);
                    setFormProdiList(res.data);
                } catch (error) {
                    console.error("Error fetching form prodi:", error);
                }
            };
            fetchFormProdi();
        } else {
            setFormProdiList([]);
        }
    }, [formData.fakultasId]);

    const { can } = usePermission();

    // const canEdit = role === "admin" || role === "kaprodi"; // Removed in favor of dynamic checks

    const handleSave = async () => {
        const payload = {
            kode: formData.kode,
            nama: formData.nama,
            deskripsi: formData.deskripsi,
            targetKetercapaian: formData.targetKetercapaian ? parseFloat(formData.targetKetercapaian) : undefined,
            prodiId: role === "kaprodi" ? profile?.prodiId : (formData.prodiId || selectedProdi),
            kurikulumId: formData.kurikulumId || null,
            // cplIds: selectedCpls // Removed
        };

        // Validasi field required
        if (!payload.kode || !payload.nama || !payload.kurikulumId) {
            toast.error("Semua field wajib harus diisi");
            return;
        }

        if (!payload.prodiId) {
            toast.error("Prodi harus dipilih");
            return;
        }

        let success = false;
        if (editingItem) {
            success = await updateProfil(editingItem.id, payload);
            if (success) {
                toast.success(`Profil "${payload.nama}" berhasil diupdate`);
            }
        } else {
            success = await createProfil(payload);
            if (success) {
                toast.success(`Profil "${payload.nama}" (${payload.kode}) berhasil ditambahkan`);
            }
        }

        if (success) {
            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData({ kode: "", nama: "", deskripsi: "", fakultasId: "", prodiId: "", kurikulumId: "", targetKetercapaian: "" });
            // setSelectedCpls([]);
        }
    };

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [profilToDelete, setProfilToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setProfilToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (profilToDelete) {
            await deleteProfil(profilToDelete);
            setDeleteDialogOpen(false);
            setProfilToDelete(null);
        }
    };

    const openEdit = (item: ProfilLulusan) => {
        setEditingItem(item);
        setFormData({
            kode: item.kode,
            nama: item.nama,
            deskripsi: item.deskripsi,
            fakultasId: item.prodi?.fakultasId || "",
            prodiId: item.prodiId,
            kurikulumId: item.kurikulumId || "",
            targetKetercapaian: item.targetKetercapaian ? item.targetKetercapaian.toString() : ""
        });
        // If we want to pre-fill fakultas, we'd need to fetch the prodi details first or have it in the item.
        // For now, leaving it empty or maybe try to find it in the global prodiList if loaded?
        // But global prodiList might be filtered.

        // Map existing CPLs - Removed
        // const mappedCpls = (item as any).cplMappings?.map((m: any) => m.cplId) || [];
        // setSelectedCpls(mappedCpls);
        setIsDialogOpen(true);
    };

    return (
        <DashboardPage title="Profil Lulusan" description="Kelola profil karir yang diharapkan dari lulusan">
            <div className="space-y-6">
                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari profil atau program studi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {role === "admin" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={selectedProdi ? "default" : "outline"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                    <span className="sm:hidden">Filter</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Fakultas</Label>
                                    <Select value={selectedFakultas} onValueChange={(val) => {
                                        setSelectedFakultas(val);
                                        setSelectedProdi(""); // Reset Prodi when Fakultas changes
                                    }}>
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Semua Fakultas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fakultasList.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-medium">Program Studi</Label>
                                    <Select
                                        value={selectedProdi}
                                        onValueChange={setSelectedProdi}
                                        disabled={!selectedFakultas}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs">
                                            <SelectValue placeholder="Semua Program Studi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prodiList.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm("");
                            if (role === "admin") {
                                setSelectedFakultas("");
                                setSelectedProdi("");
                            }
                        }}
                        disabled={!searchTerm && !selectedProdi && !selectedFakultas}
                    >
                        Reset Filter
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Profil Lulusan</CardTitle>
                            <CardDescription>
                                Menampilkan {profilList.length} dari {pagination.totalItems} Profil Lulusan
                            </CardDescription>
                        </div>
                        {can('create', 'profil_lulusan') && (
                            <Button onClick={() => {
                                setEditingItem(null);
                                setFormData({ kode: "", nama: "", deskripsi: "", fakultasId: selectedFakultas, prodiId: selectedProdi, kurikulumId: "", targetKetercapaian: "" });
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Profil
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading && profilList.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner size="lg" />
                            </div>
                        ) : !selectedProdi && !searchTerm ? (
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">Pilih Program Studi</h3>
                                <p className="text-muted-foreground mb-4">Silakan pilih Program Studi terlebih dahulu untuk menampilkan data Profil Lulusan.</p>
                            </div>
                        ) : profilList && profilList.length > 0 ? (
                            <div className="rounded-md border">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">No</TableHead>
                                                <TableHead className="w-[100px]">Kode</TableHead>
                                                <TableHead className="w-[200px]">Nama Profil</TableHead>
                                                <TableHead>Kurikulum</TableHead>
                                                <TableHead>Deskripsi</TableHead>

                                                {role !== 'mahasiswa' && <TableHead className="w-[100px]">Target</TableHead>}
                                                {role === "mahasiswa" && <TableHead className="w-[200px]">Ketercapaian</TableHead>}
                                                {(role !== 'mahasiswa' || can('edit', 'profil_lulusan')) && <TableHead>Mapping CPL</TableHead>}
                                                {(can('edit', 'profil_lulusan') || can('delete', 'profil_lulusan')) && <TableHead className="w-[100px] text-right">Aksi</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {profilList.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        {(pagination.page - 1) * pagination.limit + index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{item.kode}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                                                <Briefcase className="w-4 h-4" />
                                                            </div>
                                                            {item.nama}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.kurikulum?.nama || '-'}</TableCell>
                                                    <TableCell className="text-muted-foreground">{item.deskripsi || "-"}</TableCell>
                                                    {role !== 'mahasiswa' && (
                                                        <TableCell>{item.targetKetercapaian || "-"}</TableCell>
                                                    )}
                                                    {role === "mahasiswa" && (
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between text-xs">
                                                                    <span className="font-medium">{item.percentage || 0}%</span>
                                                                    <span className={
                                                                        Number(item.percentage || 0) >= Number(item.targetKetercapaian || 70) ? "text-green-600 font-bold" : "text-red-500 font-bold"
                                                                    }>
                                                                        {Number(item.percentage || 0) >= Number(item.targetKetercapaian || 70) ? "Tercapai" : "Belum Tercapai"}
                                                                        <div className="text-[10px] text-gray-500 font-normal">
                                                                            DEBUG: P:{item.percentage}({typeof item.percentage}) {'>='} T:{item.targetKetercapaian}({typeof item.targetKetercapaian})
                                                                            <br />
                                                                            Res: {Number(item.percentage || 0) >= Number(item.targetKetercapaian || 70) ? 'True' : 'False'}
                                                                        </div>
                                                                    </span>
                                                                </div>
                                                                <Progress value={item.percentage || 0} className="h-2" />
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {(role !== 'mahasiswa' || can('edit', 'profil_lulusan')) && (
                                                        <TableCell>
                                                            <div className="flex items-center justify-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        // Determine fakultasId. If admin selected one, use it.
                                                                        // If not, we might need to rely on the item's prodi -> fakultas relation if available,
                                                                        // or just pass prodiId and hope CPL page handles it (it might need fakultasId for filter logic).
                                                                        // For now, let's pass selectedFakultas if available.
                                                                        const targetFakultasId = selectedFakultas;
                                                                        navigate(`/dashboard/cpl?view=matrix&fakultasId=${targetFakultasId}&prodiId=${item.prodiId}`, {
                                                                            state: {
                                                                                from: 'profil-lulusan',
                                                                                filters: {
                                                                                    page: pagination.page,
                                                                                    searchTerm,
                                                                                    fakultasId: selectedFakultas,
                                                                                    prodiId: selectedProdi
                                                                                }
                                                                            }
                                                                        });
                                                                    }}
                                                                    title="Lihat Mapping CPL"
                                                                >
                                                                    <Eye className="w-4 h-4 text-blue-600" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    {(can('edit', 'profil_lulusan') || can('delete', 'profil_lulusan')) && (
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {can('edit', 'profil_lulusan') && (
                                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                {can('delete', 'profil_lulusan') && (
                                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">Belum ada Profil Lulusan</h3>
                                <p className="text-muted-foreground mb-4">Tambahkan profil lulusan untuk mulai memetakan karir.</p>
                                {can('create', 'profil_lulusan') && (
                                    <Button onClick={() => {
                                        setEditingItem(null);
                                        setFormData({ kode: "", nama: "", deskripsi: "", fakultasId: selectedFakultas, prodiId: selectedProdi, kurikulumId: "", targetKetercapaian: "" });
                                        setIsDialogOpen(true);
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" /> Tambah Profil
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-end space-x-2 py-4 border-t mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
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
                                    onClick={() => pagination.setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                                    disabled={pagination.page === pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Dialog Form */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Profil" : "Tambah Profil Baru"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <RequiredLabel className="text-right" required>Kode</RequiredLabel>
                                <Input
                                    className="col-span-3"
                                    value={formData.kode}
                                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                                    placeholder="Contoh: PL-01"
                                    required
                                />
                            </div>

                            {role === "admin" && (
                                <>
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <RequiredLabel className="text-right" required>Fakultas</RequiredLabel>
                                        <div className="col-span-3">
                                            <Select
                                                value={formData.fakultasId}
                                                onValueChange={(val) => setFormData({ ...formData, fakultasId: val, prodiId: "" })}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Fakultas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fakultasList.map(f => (
                                                        <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 items-center">
                                        <RequiredLabel className="text-right" required>Program Studi</RequiredLabel>
                                        <div className="col-span-3">
                                            <Select
                                                value={formData.prodiId}
                                                onValueChange={(val) => setFormData({ ...formData, prodiId: val })}
                                                disabled={!formData.fakultasId}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih Program Studi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {formProdiList.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-4 gap-4 items-center">
                                <RequiredLabel className="text-right" required>Kurikulum</RequiredLabel>
                                <div className="col-span-3">
                                    <Select
                                        value={formData.kurikulumId}
                                        onValueChange={(val) => setFormData({ ...formData, kurikulumId: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kurikulum" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kurikulumList
                                                .filter(k => k.isActive || k.id === formData.kurikulumId)
                                                .map((k: any) => (
                                                    <SelectItem key={k.id} value={k.id}>
                                                        {k.nama} {!k.isActive && "(Tidak Aktif)"}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 items-center">
                                <RequiredLabel className="text-right" required>Nama Profil</RequiredLabel>
                                <Input
                                    className="col-span-3"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Software Engineer"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-4 items-center">
                                <Label className="text-right">Target</Label>
                                <Input
                                    className="col-span-3"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={formData.targetKetercapaian}
                                    onChange={(e) => setFormData({ ...formData, targetKetercapaian: e.target.value })}
                                    placeholder="Target (0-100)"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 items-start">
                                <Label className="text-right pt-2">Deskripsi</Label>
                                <Textarea
                                    className="col-span-3"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    rows={3}
                                    placeholder="Deskripsi singkat tentang profil ini..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Hapus Profil Lulusan"
                description="Apakah Anda yakin ingin menghapus profil ini? Data terkait mungkin akan terpengaruh."
            />
        </DashboardPage >
    );
}

