import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { Pagination } from "@/components/common/Pagination";

import {
    getAllKurikulum,
    createKurikulum,
    updateKurikulum,
    deleteKurikulum,
    type Kurikulum,
    type CreateKurikulumData
} from "@/services/kurikulum";
import { usePermission } from "@/contexts/PermissionContext";

export default function KurikulumPage({ isTabContent = false }: { isTabContent?: boolean }) {
    const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterActive, setFilterActive] = useState(true); // Default to showing only active
    const [isDataChanged, setIsDataChanged] = useState(false);
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedKurikulum, setSelectedKurikulum] = useState<Kurikulum | null>(null);

    const {
        register: registerAdd,
        handleSubmit: handleSubmitAdd,
        reset: resetAdd,
        setValue: setValueAdd,
        watch: watchAdd,
        formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd }
    } = useForm<CreateKurikulumData>({
        defaultValues: {
            isActive: false
        }
    });

    const addIsActive = watchAdd('isActive');

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        setValue: setValueEdit,
        watch: watchEdit,
        setValue: setEditValue,
        formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit }
    } = useForm<CreateKurikulumData>();

    const editIsActive = watchEdit('isActive');

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getAllKurikulum();
            setKurikulumList(data);
        } catch (error) {
            console.error("Failed to fetch kurikulum:", error);
            toast.error("Gagal memuat data kurikulum");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isDataChanged]);

    const onAddSubmit = async (data: CreateKurikulumData) => {
        try {
            await createKurikulum(data);
            toast.success(`Kurikulum "${data.nama}" (${data.tahunMulai}) berhasil ditambahkan`);
            setIsAddDialogOpen(false);
            resetAdd();
            setIsDataChanged(!isDataChanged);
        } catch (error) {
            console.error("Failed to create kurikulum:", error);
            toast.error("Gagal menambahkan kurikulum");
        }
    };

    const onEditSubmit = async (data: CreateKurikulumData) => {
        if (!selectedKurikulum) return;

        try {
            await updateKurikulum(selectedKurikulum.id, data);
            toast.success(`Kurikulum "${data.nama}" berhasil diperbarui`);
            setIsEditDialogOpen(false);
            setSelectedKurikulum(null);
            setIsDataChanged(!isDataChanged);
        } catch (error) {
            console.error("Failed to update kurikulum:", error);
            toast.error("Gagal memperbarui kurikulum");
        }
    };

    const handleDelete = async () => {
        if (!selectedKurikulum) return;

        try {
            await deleteKurikulum(selectedKurikulum.id);
            toast.success("Kurikulum berhasil dihapus");
            setIsDeleteDialogOpen(false);
            setSelectedKurikulum(null);
            setIsDataChanged(!isDataChanged);
        } catch (error) {
            console.error("Failed to delete kurikulum:", error);
            toast.error("Gagal menghapus kurikulum");
        }
    };

    const openEditDialog = (item: Kurikulum) => {
        setSelectedKurikulum(item);
        setValueEdit("nama", item.nama);
        setValueEdit("tahunMulai", item.tahunMulai);
        setValueEdit("tahunSelesai", item.tahunSelesai);
        setValueEdit("isActive", item.isActive);
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (item: Kurikulum) => {
        setSelectedKurikulum(item);
        setIsDeleteDialogOpen(true);
    };

    const filteredList = kurikulumList.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterActive ? item.isActive : true) // If filterActive is true, show only active. If false, show all.
    );

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 10;
    const totalPages = Math.ceil(filteredList.length / limit) || 1;
    const paginatedList = filteredList.slice((page - 1) * limit, page * limit);

    // Reset page when filter changes
    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterActive]);

    return (
        <div className="flex flex-col gap-6">
            {!isTabContent && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Kurikulum</h1>
                    <p className="text-muted-foreground">
                        Kelola data kurikulum, termasuk tahun mulai dan status aktif.
                    </p>
                </div>
            )}

            {canManage && !isTabContent && (
                <CollapsibleGuide title="Panduan Manajemen Kurikulum">
                    <div className="space-y-3">
                        <p>Kurikulum berfungsi sebagai wadah utama yang mengikat seluruh struktur akademik, mulai dari CPL, Mata Kuliah, hingga Profil Lulusan.</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            <li><strong>Status Aktif:</strong> Hanya kurikulum berstatus aktif yang dapat digunakan dalam proses pemetaan dan penilaian.</li>
                            <li><strong>Tahun Mulai:</strong> Menentukan kapan angkatan mahasiswa mulai menggunakan kurikulum ini.</li>
                            <li><strong>Binding:</strong> Hubungan antara angkatan mahasiswa dengan kurikulum tertentu diatur pada halaman <em>Master Angkatan</em>.</li>
                        </ul>
                    </div>
                </CollapsibleGuide>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle>Daftar Kurikulum</CardTitle>
                        <CardDescription>
                            Total {filteredList.length} kurikulum terdaftar
                        </CardDescription>
                    </div>
                    {can('create', 'kurikulum') && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Kurikulum
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Kurikulum Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan detail kurikulum baru di bawah ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <RequiredLabel htmlFor="nama" required>Nama Kurikulum</RequiredLabel>
                                        <Input
                                            id="nama"
                                            placeholder="Contoh: Kurikulum 2024"
                                            {...registerAdd("nama", { required: "Nama kurikulum wajib diisi" })}
                                        />
                                        {errorsAdd.nama && (
                                            <p className="text-sm text-destructive">{errorsAdd.nama.message}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <RequiredLabel htmlFor="tahunMulai" required>Tahun Mulai</RequiredLabel>
                                            <Input
                                                id="tahunMulai"
                                                type="number"
                                                placeholder="2024"
                                                {...registerAdd("tahunMulai", {
                                                    required: "Tahun mulai wajib diisi",
                                                    min: { value: 2000, message: "Tahun tidak valid" }
                                                })}
                                            />
                                            {errorsAdd.tahunMulai && (
                                                <p className="text-sm text-destructive">{errorsAdd.tahunMulai.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tahunSelesai">Tahun Selesai (Opsional)</Label>
                                            <Input
                                                id="tahunSelesai"
                                                type="number"
                                                placeholder="2028"
                                                {...registerAdd("tahunSelesai")}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="add-isActive"
                                            checked={addIsActive}
                                            onCheckedChange={(checked) => setValueAdd('isActive', checked)}
                                        />
                                        <Label htmlFor="add-isActive">
                                            {addIsActive ? "Active" : "Inactive"}
                                        </Label>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button type="submit" disabled={isSubmittingAdd}>
                                            {isSubmittingAdd ? "Menyimpan..." : "Simpan"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between py-4">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari kurikulum..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="filter-active"
                                checked={!filterActive}
                                onCheckedChange={(checked) => setFilterActive(!checked)}
                            />
                            <Label htmlFor="filter-active" className="text-sm font-medium">
                                Tampilkan Arsip (Tidak Aktif)
                            </Label>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kurikulum</TableHead>
                                    <TableHead>Tahun Mulai</TableHead>
                                    <TableHead>Tahun Selesai</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            {filteredList.length === 0 ? "Tidak ada data kurikulum ditemukan" : "Halaman kosong"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedList.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell>{item.tahunMulai}</TableCell>
                                            <TableCell>{item.tahunSelesai || "-"}</TableCell>
                                            <TableCell>
                                                {item.isActive ? (
                                                    <Badge className="bg-green-500">Aktif</Badge>
                                                ) : (
                                                    <Badge variant="outline">Tidak Aktif</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {can('update', 'kurikulum') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(item)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {can('delete', 'kurikulum') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => openDeleteDialog(item)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredList.length > 0 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Kurikulum</DialogTitle>
                        <DialogDescription>
                            Ubah detail kurikulum di bawah ini.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="edit-nama" required>Nama Kurikulum</RequiredLabel>
                            <Input
                                id="edit-nama"
                                {...registerEdit("nama", { required: "Nama kurikulum wajib diisi" })}
                            />
                            {errorsEdit.nama && (
                                <p className="text-sm text-destructive">{errorsEdit.nama.message}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <RequiredLabel htmlFor="edit-tahunMulai" required>Tahun Mulai</RequiredLabel>
                                <Input
                                    id="edit-tahunMulai"
                                    type="number"
                                    {...registerEdit("tahunMulai", {
                                        required: "Tahun mulai wajib diisi",
                                        min: { value: 2000, message: "Tahun tidak valid" }
                                    })}
                                />
                                {errorsEdit.tahunMulai && (
                                    <p className="text-sm text-destructive">{errorsEdit.tahunMulai.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-tahunSelesai">Tahun Selesai (Opsional)</Label>
                                <Input
                                    id="edit-tahunSelesai"
                                    type="number"
                                    {...registerEdit("tahunSelesai")}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-isActive"
                                checked={editIsActive}
                                onCheckedChange={(checked) => setEditValue('isActive', checked)}
                            />
                            <Label htmlFor="edit-isActive">
                                {editIsActive ? "Active" : "Inactive"}
                            </Label>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmittingEdit}>
                                {isSubmittingEdit ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Kurikulum <strong>{selectedKurikulum?.nama}</strong> akan dihapus secara permanen.
                            Pastikan tidak ada mata kuliah yang terhubung dengan kurikulum ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
