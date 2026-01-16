import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/contexts/PermissionContext";
import { Angkatan, getAllAngkatan, createAngkatan, updateAngkatan, deleteAngkatan } from "@/services/angkatan";
import { Kurikulum, getAllKurikulum } from "@/services/kurikulum";

interface AngkatanFormData {
    tahun: number;
    isActive: boolean;
    kurikulumId: string | null;
}

export default function AngkatanPage({ isTabContent = false }: { isTabContent?: boolean }) {
    const { can } = usePermission();
    const [angkatanList, setAngkatanList] = useState<Angkatan[]>([]);
    const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAngkatan, setSelectedAngkatan] = useState<Angkatan | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<AngkatanFormData>({
        defaultValues: {
            tahun: new Date().getFullYear(),
            isActive: true,
            kurikulumId: null
        }
    });

    const canManage = can('access', 'kaprodi') || can('access', 'admin');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [angkatanData, kurikulumData] = await Promise.all([
                getAllAngkatan(),
                getAllKurikulum()
            ]);
            setAngkatanList(angkatanData);
            setKurikulumList(kurikulumData);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAngkatan = angkatanList.filter(item =>
        item.tahun.toString().includes(searchQuery) ||
        item.kurikulum?.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async (data: AngkatanFormData) => {
        try {
            await createAngkatan(data);
            toast.success(`Angkatan ${data.tahun} berhasil ditambahkan`);
            setIsAddDialogOpen(false);
            reset();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal menambahkan angkatan");
        }
    };

    const handleEdit = async (data: AngkatanFormData) => {
        if (!selectedAngkatan) return;
        try {
            await updateAngkatan(selectedAngkatan.id, data);
            toast.success(`Angkatan ${data.tahun} berhasil diperbarui`);
            setIsEditDialogOpen(false);
            setSelectedAngkatan(null);
            reset();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal memperbarui angkatan");
        }
    };

    const handleDelete = async () => {
        if (!selectedAngkatan) return;
        try {
            await deleteAngkatan(selectedAngkatan.id);
            toast.success("Angkatan berhasil dihapus");
            setIsDeleteDialogOpen(false);
            setSelectedAngkatan(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Gagal menghapus angkatan");
        }
    };

    const openEditDialog = (angkatan: Angkatan) => {
        setSelectedAngkatan(angkatan);
        setValue("tahun", angkatan.tahun);
        setValue("isActive", angkatan.isActive);
        setValue("kurikulumId", angkatan.kurikulumId || null);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {!isTabContent ? (
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Data Angkatan</h1>
                        <p className="text-muted-foreground">
                            Kelola data angkatan dan kurikulum yang berlaku
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={() => { reset(); setIsAddDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Angkatan
                        </Button>
                    )}
                </div>
            ) : (
                canManage && (
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => { reset(); setIsAddDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Angkatan
                        </Button>
                    </div>
                )
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Angkatan & Kurikulum</CardTitle>
                    <CardDescription>
                        Manajemen mapping angkatan ke kurikulum
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari tahun atau kurikulum..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tahun Angkatan</TableHead>
                                    <TableHead>Kurikulum Berlaku</TableHead>
                                    <TableHead>Status</TableHead>
                                    {canManage && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Memuat data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredAngkatan.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Tidak ada data angkatan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAngkatan.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.tahun}</TableCell>
                                            <TableCell>
                                                {item.kurikulum ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                                                        {item.kurikulum.nama} ({item.kurikulum.tahunMulai})
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Belum disetting</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? "Aktif" : "Non-aktif"}
                                                </Badge>
                                            </TableCell>
                                            {canManage && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(item)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => {
                                                                setSelectedAngkatan(item);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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

            {/* Dialog Tambah */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Angkatan Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="tahun" required>Tahun Angkatan</RequiredLabel>
                            <Input
                                id="tahun"
                                type="number"
                                placeholder="Contoh: 2024"
                                {...register("tahun", { required: "Tahun wajib diisi", min: 2000, max: 2100 })}
                            />
                            {errors.tahun && <p className="text-sm text-red-500">{errors.tahun.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="kurikulumId">Kurikulum Berlaku</Label>
                            <Select onValueChange={(val) => setValue("kurikulumId", val === "null" ? null : val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kurikulum" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Tanpa Kurikulum</SelectItem>
                                    {kurikulumList
                                        .filter(k => k.isActive || k.id === watch("kurikulumId"))
                                        .map((k) => (
                                            <SelectItem key={k.id} value={k.id}>
                                                {k.nama} ({k.tahunMulai}) {!k.isActive && "(Tidak Aktif)"}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={watch("isActive")}
                                onCheckedChange={(val) => setValue("isActive", val)}
                            />
                            <Label htmlFor="isActive">Status Aktif</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Angkatan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleEdit)} className="space-y-4">
                        <div className="space-y-2">
                            <RequiredLabel htmlFor="edit-tahun" required>Tahun Angkatan</RequiredLabel>
                            <Input
                                id="edit-tahun"
                                type="number"
                                {...register("tahun", { required: "Tahun wajib diisi" })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-kurikulumId">Kurikulum Berlaku</Label>
                            <Select
                                value={watch("kurikulumId") || "null"}
                                onValueChange={(val) => setValue("kurikulumId", val === "null" ? null : val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kurikulum" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Tanpa Kurikulum</SelectItem>
                                    {kurikulumList
                                        .filter(k => k.isActive || k.id === watch("kurikulumId"))
                                        .map((k) => (
                                            <SelectItem key={k.id} value={k.id}>
                                                {k.nama} ({k.tahunMulai}) {!k.isActive && "(Tidak Aktif)"}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-isActive"
                                checked={watch("isActive")}
                                onCheckedChange={(val) => setValue("isActive", val)}
                            />
                            <Label htmlFor="edit-isActive">Status Aktif</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Hapus */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Data angkatan {selectedAngkatan?.tahun} akan dihapus permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
