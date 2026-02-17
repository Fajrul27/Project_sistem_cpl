
import { useState } from 'react';
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useSkalaNilai, SkalaNilai } from '@/hooks/useSkalaNilai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash, Plus, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { CollapsibleGuide } from '@/components/common/CollapsibleGuide';
import { usePermission } from '@/contexts/PermissionContext';

export default function SkalaNilaiPage() {
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');
    const { skalaNilaiList, loading, createSkalaNilai, updateSkalaNilai, deleteSkalaNilai } = useSkalaNilai();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SkalaNilai | null>(null);
    const [formData, setFormData] = useState({
        huruf: '',
        nilaiMin: '',
        nilaiMax: '',
        isLulus: true
    });

    const handleOpenDialog = (item?: SkalaNilai) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                huruf: item.huruf,
                nilaiMin: item.nilaiMin.toString(),
                nilaiMax: item.nilaiMax.toString(),
                isLulus: item.isLulus
            });
        } else {
            setEditingItem(null);
            setFormData({ huruf: '', nilaiMin: '', nilaiMax: '', isLulus: true });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            huruf: formData.huruf,
            nilaiMin: parseFloat(formData.nilaiMin),
            nilaiMax: parseFloat(formData.nilaiMax),
            isLulus: formData.isLulus
        };

        if (editingItem) {
            const res = await updateSkalaNilai(editingItem.id, payload);
            if (res.success) {
                toast({ title: "Berhasil diperbarui" });
                setIsDialogOpen(false);
            }
        } else {
            const res = await createSkalaNilai(payload);
            if (res.success) {
                toast({ title: "Berhasil ditambahkan" });
                setIsDialogOpen(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus skala nilai ini?')) {
            const res = await deleteSkalaNilai(id);
            if (res.success) {
                toast({ title: "Berhasil dihapus" });
            }
        }
    };

    return (
        <DashboardPage
            title="Manajemen Skala Nilai"
            description="Atur rentang nilai huruf untuk konversi otomatis hasil evaluasi mahasiswa."
        >
            <div className="flex flex-col gap-6">
                {canManage && (
                    <CollapsibleGuide title="Panduan Skala Nilai">
                        <div className="space-y-3">
                            <p>Skala nilai digunakan oleh sistem untuk mengonversi nilai angka akhir mahasiswa menjadi grade huruf (A, B, C, dsb) secara otomatis.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Rentang Nilai:</strong> Pastikan nilai minimum dan maksimum antar grade tidak saling tumpang tindih.</li>
                                <li><strong>Status Lulus:</strong> Grade yang ditandai sebagai 'Lulus' akan memberikan kredit SKS kepada mahasiswa.</li>
                                <li><strong>Sistem/Default:</strong> Beberapa skala mungkin dikunci jika merupakan bawaan sistem yang krusial.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar Standar Nilai</CardTitle>
                            <CardDescription>Atur rentang nilai huruf untuk konversi otomatis</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Skala
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Huruf</TableHead>
                                    <TableHead>Range Nilai</TableHead>
                                    <TableHead className="text-center">Status Kelulusan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : skalaNilaiList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">Belum ada data</TableCell>
                                    </TableRow>
                                ) : (
                                    skalaNilaiList.sort((a, b) => b.nilaiMin - a.nilaiMin).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-bold">{item.huruf}</TableCell>
                                            <TableCell>{item.nilaiMin} - {item.nilaiMax}</TableCell>
                                            <TableCell className="text-center">
                                                {item.isLulus ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                                                        <CheckCircle size={12} /> Lulus
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <XCircle size={12} /> Tidak Lulus
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {!item.isSystem && (
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(item.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Skala Nilai' : 'Tambah Skala Nilai'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Huruf Mutu</Label>
                                <Input
                                    value={formData.huruf}
                                    onChange={e => setFormData({ ...formData, huruf: e.target.value })}
                                    placeholder="Contoh: A"
                                    required
                                    disabled={editingItem?.isSystem}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nilai Minimum (Inclusive)</Label>
                                <Input
                                    type="number" step="0.01"
                                    value={formData.nilaiMin}
                                    onChange={e => setFormData({ ...formData, nilaiMin: e.target.value })}
                                    placeholder="85.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nilai Maximum (Exclusive)</Label>
                                <Input
                                    type="number" step="0.01"
                                    value={formData.nilaiMax}
                                    onChange={e => setFormData({ ...formData, nilaiMax: e.target.value })}
                                    placeholder="100.00"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isLulus"
                                checked={formData.isLulus}
                                onCheckedChange={(checked) => setFormData({ ...formData, isLulus: checked as boolean })}
                            />
                            <Label htmlFor="isLulus">Status Lulus (Mahasiswa mendapatkan kredit SKS)</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardPage>
    );
}
