import { useState } from "react";
import { DashboardPage } from "@/components/layout/DashboardLayout";
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
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Search, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermission } from "@/contexts/PermissionContext";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
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
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');
    const {
        tahunAjaranList,
        loading,
        createTahunAjaran,
        updateTahunAjaran,
        deleteTahunAjaran,
        setTahunAjaranActive,
        refresh: loadParams
    } = useTahunAjaran();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TahunAjaran | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        nama: "",
        isActive: false
    });

    const handleOpenAdd = () => {
        setFormData({ nama: "", isActive: false });
        setIsAddOpen(true);
    };

    const handleOpenEdit = (item: TahunAjaran) => {
        setEditingItem(item);
        setFormData({
            nama: item.nama,
            isActive: item.isActive
        });
    };

    const handleClose = () => {
        setIsAddOpen(false);
        setEditingItem(null);
        setFormData({ nama: "", isActive: false });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            const success = await updateTahunAjaran(editingItem.id, formData);
            if (success) handleClose();
        } else {
            const success = await createTahunAjaran(formData);
            if (success) handleClose();
        }
    };

    const filteredList = tahunAjaranList.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const content = (
        <div className="flex flex-col gap-6">
            {canManage && !isTabContent && (
                <CollapsibleGuide title="Panduan Manajemen Tahun Ajaran">
                    <div className="space-y-3">
                        <p>Manajemen Tahun Ajaran digunakan untuk mengatur periode akademik yang aktif. Data ini menjadi referensi utama untuk semua aktivitas akademik (KRS, Nilai, dll).</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            <li><strong>Aktifkan Periode:</strong> Pastikan hanya ada satu tahun ajaran yang berstatus 'Aktif' pada satu waktu.</li>
                            <li><strong>Sinkronisasi:</strong> Perubahan tahun ajaran aktif akan berdampak pada dashboard dosen dan mahasiswa.</li>
                        </ul>
                    </div>
                </CollapsibleGuide>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <CardTitle>Daftar Tahun Ajaran</CardTitle>
                        <CardDescription>Total {filteredList.length} periode terdaftar</CardDescription>
                    </div>
                    {canManage && (
                        <Button onClick={handleOpenAdd} size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Tahun
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center pb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari tahun ajaran..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tahun Ajaran</TableHead>
                                    <TableHead>Status</TableHead>
                                    {canManage && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={canManage ? 3 : 2} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canManage ? 3 : 2} className="h-24 text-center text-muted-foreground">
                                            Tidak ada data ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.nama}</TableCell>
                                            <TableCell>
                                                {item.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Aktif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Tidak Aktif
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            {canManage && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {!item.isActive && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setTahunAjaranActive(item.id)}
                                                                title="Aktifkan"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(item)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setIsDeleting(item.id)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Add/Edit */}
            <Dialog open={isAddOpen || !!editingItem} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}</DialogTitle>
                        <DialogDescription>
                            Pastikan format penamaan konsisten (contoh: 2023/2024 Ganjil)
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="nama" required>Nama Tahun Ajaran</RequiredLabel>
                            <Input
                                id="nama"
                                placeholder="Contoh: 2023/2024 Ganjil"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="status"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="status">Setel sebagai Tahun Ajaran Aktif</Label>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
                            <Button type="submit">
                                {editingItem ? "Update" : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Delete */}
            <AlertDialog open={!!isDeleting} onOpenChange={(open) => !open && setIsDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Tahun Ajaran?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Menghapus tahun ajaran dapat berdampak pada data KRS dan nilai yang terkait.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (isDeleting) {
                                    await deleteTahunAjaran(isDeleting);
                                    setIsDeleting(null);
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    if (isTabContent) {
        return <div className="space-y-6">{content}</div>;
    }

    return (
        <DashboardPage title="Manajemen Tahun Ajaran" description="Kelola Data Tahun Ajaran Akademik">
            {content}
        </DashboardPage>
    );
}
