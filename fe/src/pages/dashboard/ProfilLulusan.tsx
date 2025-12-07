import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, Briefcase } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
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
    const { role, profile } = useUserRole();
    const {
        profilList,
        prodiList,
        cplList,
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

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ProfilLulusan | null>(null);
    const [selectedCpls, setSelectedCpls] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        kode: "",
        nama: "",
        deskripsi: "",
        prodiId: ""
    });

    const canEdit = role === "admin" || role === "kaprodi";

    const handleSave = async () => {
        const payload = {
            ...formData,
            prodiId: role === "kaprodi" ? profile?.prodiId : (formData.prodiId || selectedProdi),
            cplIds: selectedCpls
        };

        if (!payload.prodiId) {
            toast.error("Prodi harus dipilih");
            return;
        }

        let success = false;
        if (editingItem) {
            success = await updateProfil(editingItem.id, payload);
        } else {
            success = await createProfil(payload);
        }

        if (success) {
            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData({ kode: "", nama: "", deskripsi: "", prodiId: "" });
            setSelectedCpls([]);
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
            prodiId: item.prodiId
        });
        // Map existing CPLs
        const mappedCpls = (item as any).cplMappings?.map((m: any) => m.cplId) || [];
        setSelectedCpls(mappedCpls);
        setIsDialogOpen(true);
    };

    const toggleCplSelection = (cplId: string) => {
        setSelectedCpls(prev =>
            prev.includes(cplId)
                ? prev.filter(id => id !== cplId)
                : [...prev, cplId]
        );
    };

    return (
        <DashboardPage title="Profil Lulusan" description="Kelola profil karir yang diharapkan dari lulusan">
            <div className="space-y-6">
                {/* Filter and Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    {role === "admin" && (
                        <div className="w-full md:w-auto flex items-center gap-2">
                            <Label className="whitespace-nowrap">Prodi:</Label>
                            <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                                <SelectTrigger className="w-[200px] md:w-[300px]">
                                    <SelectValue placeholder="Pilih Prodi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {prodiList.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="w-full md:w-auto relative flex-1 max-w-sm">
                        <Input
                            placeholder="Cari profil..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Profil Lulusan</CardTitle>
                            <CardDescription>
                                Menampilkan {profilList.length} dari {pagination.totalItems} Profil Lulusan
                            </CardDescription>
                        </div>
                        {canEdit && (
                            <Button onClick={() => {
                                setEditingItem(null);
                                setFormData({ kode: "", nama: "", deskripsi: "", prodiId: selectedProdi });
                                setSelectedCpls([]);
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Profil
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading && profilList.length === 0 ? (
                            <div className="text-center py-8">Memuat...</div>
                        ) : profilList && profilList.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">No</TableHead>
                                            <TableHead className="w-[100px]">Kode</TableHead>
                                            <TableHead className="w-[200px]">Nama Profil</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            {role === "mahasiswa" && <TableHead className="w-[200px]">Ketercapaian</TableHead>}
                                            <TableHead>Mapping CPL</TableHead>
                                            {canEdit && <TableHead className="w-[100px] text-right">Aksi</TableHead>}
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
                                                <TableCell className="text-muted-foreground">{item.deskripsi || "-"}</TableCell>
                                                {role === "mahasiswa" && (
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="font-medium">{item.percentage || 0}%</span>
                                                                <span className={
                                                                    (item.percentage || 0) >= 70 ? "text-green-600" : "text-yellow-600"
                                                                }>
                                                                    {item.status || "Belum Ada Data"}
                                                                </span>
                                                            </div>
                                                            <Progress value={item.percentage || 0} className="h-2" />
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(item as any).cplMappings?.map((m: any) => (
                                                            <span key={m.cplId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                {m.cpl?.kode}
                                                            </span>
                                                        ))}
                                                        {(!(item as any).cplMappings || (item as any).cplMappings.length === 0) && (
                                                            <span className="text-muted-foreground text-xs italic">Belum ada mapping</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">Belum ada Profil Lulusan</h3>
                                <p className="text-muted-foreground mb-4">Tambahkan profil lulusan untuk mulai memetakan karir.</p>
                                {canEdit && (
                                    <Button onClick={() => {
                                        setEditingItem(null);
                                        setFormData({ kode: "", nama: "", deskripsi: "", prodiId: selectedProdi });
                                        setSelectedCpls([]);
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
                                <Label className="text-right">Kode</Label>
                                <Input
                                    className="col-span-3"
                                    value={formData.kode}
                                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                                    placeholder="Contoh: PL-01"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 items-center">
                                <Label className="text-right">Nama Profil</Label>
                                <Input
                                    className="col-span-3"
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Contoh: Software Engineer"
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

                            <div className="grid grid-cols-4 gap-4 items-start border-t pt-4 mt-4">
                                <Label className="text-right pt-2">Mapping CPL</Label>
                                <div className="col-span-3 space-y-2">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        Pilih CPL yang dibebankan pada profil lulusan ini:
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto border rounded p-2">
                                        {cplList && cplList.map(cpl => (
                                            <div key={cpl.id} className="flex items-start space-x-2 p-1 hover:bg-muted/50 rounded">
                                                <input
                                                    type="checkbox"
                                                    id={`cpl-${cpl.id}`}
                                                    className="mt-1"
                                                    checked={selectedCpls.includes(cpl.id)}
                                                    onChange={() => toggleCplSelection(cpl.id)}
                                                />
                                                <label htmlFor={`cpl-${cpl.id}`} className="text-sm cursor-pointer leading-tight">
                                                    <span className="font-bold">{cpl.kode}</span> - {cpl.deskripsi}
                                                </label>
                                            </div>
                                        ))}
                                        {(!cplList || cplList.length === 0) && (
                                            <div className="text-sm text-muted-foreground text-center py-2">
                                                Tidak ada data CPL untuk prodi ini.
                                            </div>
                                        )}
                                    </div>
                                </div>
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
        </DashboardPage>
    );
}

