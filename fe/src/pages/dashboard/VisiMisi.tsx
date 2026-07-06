import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useVisiMisi } from "@/hooks/useVisiMisi";
import { usePermission } from "@/contexts/PermissionContext";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { FilterRequiredState } from "@/components/common/FilterRequiredState";
import { ImportResultDialog } from "@/components/common/ImportResultDialog";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function VisiMisiPage() {
    const {
        role,
        visiList,
        misiList,
        fakultasList,
        selectedFakultas,
        setSelectedFakultas,
        prodiList,
        selectedProdi,
        setSelectedProdi,
        loading,
        canEdit,
        isDialogOpen,
        setIsDialogOpen,
        editingItem,
        formData,
        setFormData,
        handleSave,
        handleDelete,
        openEdit,
        openAdd,
        fetchVisiMisi
    } = useVisiMisi();
    const { can } = usePermission(); 

    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await handleDelete(itemToDelete);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (selectedProdi) queryParams.append('prodiId', selectedProdi);

            const response = await fetch(`/api/visi-misi/export/excel?${queryParams.toString()}`, {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Gagal export data');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `visi_misi_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Data berhasil diexport');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Gagal export data');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch('/api/visi-misi/template/excel', {
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Gagal download template');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `template_visi_misi.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Template berhasil diunduh');
        } catch (error) {
            console.error('Template error:', error);
            toast.error('Gagal download template');
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
                if (selectedProdi) formData.append('prodiId', selectedProdi);

                const response = await fetch('/api/visi-misi/import/excel', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'Gagal import data');

                setImportResult(result);
                toast.success('Import selesai');
                if (selectedProdi) {
                    fetchVisiMisi(selectedProdi, true);
                }
            } catch (error: any) {
                console.error('Import error:', error);
                toast.error(error.message || 'Gagal import data');
            } finally {
                setImporting(false);
            }
        };
        input.click();
    };


    return (
        <DashboardPage
            title="Visi & Misi"
            description={role === 'mahasiswa'
                ? "Lihat Visi dan Misi program studi sebagai landasan kurikulum Anda"
                : "Kelola Visi dan Misi sebagai landasan kurikulum OBE"
            }
        >
            <div className="space-y-6">
                {canEdit && (
                    <CollapsibleGuide title="Panduan Visi & Misi">
                        <div className="space-y-3">
                            <p>Visi dan Misi Program Studi merupakan fondasi utama dalam pengembangan kurikulum OBE. Seluruh Profil Lulusan dan CPL harus merujuk pada pernyataan ini.</p>
                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                <li><strong>Visi Keilmuan:</strong> Gambaran ideal cita-cita prodi dalam pengembangan ilmu pengetahuan.</li>
                                <li><strong>Misi:</strong> Langkah-langkah strategis yang dilakukan prodi untuk mencapai visinya.</li>
                                <li><strong>Hubungan:</strong> Perubahan pada Visi/Misi sebaiknya diikuti dengan peninjauan kembali relevansi Profil Lulusan dan CPL.</li>
                            </ul>
                        </div>
                    </CollapsibleGuide>
                )}
                {/* Filter Prodi (Admin Only) */}
                {role === "admin" && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex items-center gap-2">
                                    <Label className="min-w-[80px]">Fakultas:</Label>
                                    <Select
                                        value={selectedFakultas}
                                        onValueChange={setSelectedFakultas}
                                        disabled={false}
                                    >
                                        <SelectTrigger className="w-[300px]">
                                            <SelectValue placeholder="Pilih Fakultas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fakultasList.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="min-w-[80px]">Prodi:</Label>
                                    <Select
                                        value={selectedProdi}
                                        onValueChange={setSelectedProdi}
                                        disabled={!selectedFakultas}
                                    >
                                        <SelectTrigger className="w-[300px]">
                                            <SelectValue placeholder="Pilih Prodi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {prodiList.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Button variant="outline" size="sm" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" /> Export
                                </Button>
                                {can('create', 'visi_misi') && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                                            <Download className="w-4 h-4 mr-2" /> Template
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
                                            <Upload className="w-4 h-4 mr-2" /> {importing ? 'Importing...' : 'Import'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* VISI SECTION */}
                {!selectedProdi && role === "admin" ? (
                    <Card>
                        <CardContent className="pt-6">
                            <FilterRequiredState
                                message="Silakan pilih Fakultas dan Program Studi terlebih dahulu untuk menampilkan Visi & Misi."
                            />
                        </CardContent>
                    </Card>
                ) : !selectedProdi && loading ? (
                    <div className="text-center py-10">Memuat data...</div>
                ) : !selectedProdi ? (
                    <div className="text-center py-10 text-muted-foreground">Data tidak tersedia untuk profil Anda.</div>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Visi Keilmuan</CardTitle>
                                    <CardDescription>Cita-cita luhur program studi di masa depan</CardDescription>
                                </div>
                                {can('create', 'visi_misi') && visiList.length === 0 && (
                                    <Button size="sm" onClick={() => openAdd("visi")}>
                                        <Plus className="w-4 h-4 mr-2" /> Tambah Visi
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-4">Memuat...</div>
                                ) : visiList.length > 0 ? (
                                    <div className="bg-muted/30 p-6 rounded-lg border text-lg font-medium text-center italic relative group">
                                        "{visiList[0].teks}"
                                        {can('edit', 'visi_misi') && (
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(visiList[0])}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">Belum ada data Visi</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* MISI SECTION */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Misi Program Studi</CardTitle>
                                    <CardDescription>Langkah-langkah strategis untuk mencapai Visi</CardDescription>
                                </div>
                                {can('create', 'visi_misi') && (
                                    <Button size="sm" onClick={() => openAdd("misi")}>
                                        <Plus className="w-4 h-4 mr-2" /> Tambah Misi
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-4">Memuat...</div>
                                ) : misiList.length > 0 ? (
                                    <div className="space-y-4">
                                        {misiList.map((item, index) => (
                                            <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors group">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-base leading-relaxed">{item.teks}</p>
                                                </div>
                                                {(can('edit', 'visi_misi') || can('delete', 'visi_misi')) && (
                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        {can('edit', 'visi_misi') && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {can('delete', 'visi_misi') && (
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(item.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">Belum ada data Misi</div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Dialog Form */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit" : "Tambah"} {formData.tipe === 'visi' ? 'Visi' : 'Misi'}</DialogTitle>
                            <DialogDescription>
                                Masukkan teks {formData.tipe} secara lengkap dan jelas.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <RequiredLabel required>Teks {formData.tipe === 'visi' ? 'Visi' : 'Misi'}</RequiredLabel>
                                <Textarea
                                    value={formData.teks}
                                    onChange={(e) => setFormData({ ...formData, teks: e.target.value })}
                                    rows={5}
                                    placeholder={`Masukkan bunyi ${formData.tipe}...`}
                                    required
                                />
                            </div>
                            {formData.tipe === 'misi' && (
                                <div className="space-y-2">
                                    <Label>Urutan</Label>
                                    <Input
                                        type="number"
                                        value={formData.urutan}
                                        onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) })}
                                        min={1}
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <ImportResultDialog
                    open={!!importResult}
                    onOpenChange={(open) => !open && setImportResult(null)}
                    result={importResult}
                    title="Hasil Import Visi & Misi"
                    description="Proses import data visi, misi, dan tujuan telah selesai."
                />

                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    onConfirm={confirmDelete}
                    title="Hapus Visi/Misi"
                    description="Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan."
                />
            </div>
        </DashboardPage>

    );
}
