import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
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
        openAdd
    } = useVisiMisi();
    const { can } = usePermission(); // Add this line

    return (
        <DashboardPage title="Visi & Misi Program Studi" description="Kelola Visi dan Misi sebagai landasan kurikulum OBE">
            <div className="space-y-6">
                {/* Filter Prodi (Admin Only) */}
                {role === "admin" && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex items-center gap-2">
                                    <Label className="min-w-[80px]">Fakultas:</Label>
                                    <Select value={selectedFakultas} onValueChange={setSelectedFakultas}>
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
                                    <Select value={selectedProdi} onValueChange={setSelectedProdi} disabled={!selectedFakultas}>
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
                        </CardContent>
                    </Card>
                )}

                {/* VISI SECTION */}
                {!selectedProdi && role === "admin" ? (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                        <h3 className="text-lg font-medium">Pilih Program Studi</h3>
                        <p className="text-muted-foreground">Silakan pilih Fakultas dan Program Studi terlebih dahulu untuk menampilkan Visi & Misi.</p>
                    </div>
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
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
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
            </div>
        </DashboardPage>
    );
}
