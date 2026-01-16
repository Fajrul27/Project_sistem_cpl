import { useState } from "react";
import { useTahunAjaran, TahunAjaran } from "@/hooks/useTahunAjaran";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
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

export default function TahunAjaranPage({ isTabContent = false }: { isTabContent?: boolean }) {
    const {
        tahunAjaranList,
        loading,
        createTahunAjaran,
        updateTahunAjaran,
        deleteTahunAjaran,
        setTahunAjaranActive
    } = useTahunAjaran();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TahunAjaran | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nama: "",
        isActive: false
    });

    const handleOpenAdd = () => {
        setFormData({ nama: "", isActive: false });
        setIsAddOpen(true);
    };

    const handleOpenEdit = (item: TahunAjaran) => {
        setFormData({ nama: item.nama, isActive: item.isActive });
        setEditingItem(item);
    };

    const handleClose = () => {
        setIsAddOpen(false);
        setEditingItem(null);
        setFormData({ nama: "", isActive: false });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;

        if (editingItem) {
            success = await updateTahunAjaran(editingItem.id, formData);
        } else {
            success = await createTahunAjaran(formData);
        }

        if (success) {
            handleClose();
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteTahunAjaran(deleteId);
            setDeleteId(null);
        }
    };

    const handleSetActive = async (item: TahunAjaran) => {
        if (!item.isActive) {
            await setTahunAjaranActive(item.id);
        }
    };

    return (
        <div className="space-y-6">
            {!isTabContent && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tahun Ajaran</h1>
                        <p className="text-muted-foreground">
                            Kelola data tahun ajaran akademik sistem.
                        </p>
                    </div>
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Tahun Ajaran
                    </Button>
                </div>
            )}

            {isTabContent && (
                <div className="flex justify-end mb-4">
                    <Button onClick={handleOpenAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Tahun Ajaran
                    </Button>
                </div>
            )}

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Tahun Ajaran</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : tahunAjaranList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    Belum ada data tahun ajaran.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tahunAjaranList.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.nama}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {item.isActive ? (
                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Tidak Aktif
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {!item.isActive && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetActive(item)}
                                                title="Set sebagai aktif"
                                            >
                                                <CheckCircle className="h-4 w-4 text-muted-foreground hover:text-green-500" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteId(item.id)}
                                            disabled={item.isActive} // Prevent deleting active year safely
                                            title={item.isActive ? "Tidak dapat menghapus tahun ajaran aktif" : "Hapus"}
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

            {/* Dialog Add/Edit */}
            <Dialog open={isAddOpen || !!editingItem} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem
                                ? "Ubah detail tahun ajaran."
                                : "Tambahkan tahun ajaran baru ke dalam sistem."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Tahun Ajaran</Label>
                            <Input
                                id="nama"
                                placeholder="Contoh: 2025/2026 Ganjil"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="isActive">Set sebagai Tahun Ajaran Aktif?</Label>
                        </div>
                        {formData.isActive && (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                Perhatian: Mengaktifkan tahun ajaran ini akan menonaktifkan tahun ajaran yang sedang berjalan.
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingItem ? "Simpan Perubahan" : "Tambah"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Delete */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data tahun ajaran akan dihapus permanen.
                            Pastikan tidak ada data penilaian yang terkait dengan tahun ajaran ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
