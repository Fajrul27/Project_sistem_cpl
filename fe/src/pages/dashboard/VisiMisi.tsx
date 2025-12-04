import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface VisiMisi {
    id: string;
    teks: string;
    tipe: "visi" | "misi";
    urutan: number;
    prodiId: string;
    prodi?: { nama: string };
}

interface Prodi {
    id: string;
    nama: string;
}

export default function VisiMisiPage() {
    const { role, profile, loading: roleLoading } = useUserRole();
    const [visiMisiList, setVisiMisiList] = useState<VisiMisi[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);
    const [selectedProdi, setSelectedProdi] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<VisiMisi | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        teks: "",
        tipe: "misi",
        urutan: 1,
        prodiId: ""
    });

    const canEdit = role === "admin" || role === "kaprodi";

    useEffect(() => {
        if (!roleLoading) {
            fetchInitialData();
        }
    }, [role, profile, roleLoading]);

    useEffect(() => {
        if (selectedProdi) {
            fetchVisiMisi(selectedProdi);
        }
    }, [selectedProdi]);

    const fetchInitialData = async () => {
        try {
            // Fetch Prodi List for Admin
            if (role === "admin") {
                const res = await api.get("/prodi");
                setProdiList(res.data);
                if (res.data.length > 0) setSelectedProdi(res.data[0].id);
            } else if ((role === "kaprodi" || role === "dosen") && profile?.prodiId) {
                // Kaprodi and Dosen automatically selected
                setSelectedProdi(profile.prodiId);
            } else if (role === "kaprodi" || role === "dosen") {
                // If role is set but profile/prodiId is missing, wait or show error
                // Do not fallback to fetching all prodis
                console.warn("User has role but missing prodiId in profile");
            } else {
                // Fallback for others
                const res = await api.get("/prodi");
                setProdiList(res.data);
                if (res.data.length > 0) setSelectedProdi(res.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            toast.error("Gagal memuat data prodi");
        }
    };

    const fetchVisiMisi = async (prodiId: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/visi-misi?prodiId=${prodiId}`);
            setVisiMisiList(res.data);
        } catch (error) {
            console.error("Error fetching visi misi:", error);
            toast.error("Gagal memuat data visi misi");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                prodiId: role === "kaprodi" ? profile?.prodiId : (formData.prodiId || selectedProdi)
            };

            if (!payload.prodiId) {
                toast.error("Prodi harus dipilih");
                return;
            }

            if (editingItem) {
                await api.put(`/visi-misi/${editingItem.id}`, payload);
                toast.success("Berhasil diperbarui");
            } else {
                await api.post("/visi-misi", payload);
                toast.success("Berhasil ditambahkan");
            }

            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData({ teks: "", tipe: "misi", urutan: 1, prodiId: "" });
            fetchVisiMisi(selectedProdi);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan data");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus?")) return;
        try {
            await api.delete(`/visi-misi/${id}`);
            toast.success("Berhasil dihapus");
            fetchVisiMisi(selectedProdi);
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Gagal menghapus");
        }
    };

    const openEdit = (item: VisiMisi) => {
        setEditingItem(item);
        setFormData({
            teks: item.teks,
            tipe: item.tipe,
            urutan: item.urutan,
            prodiId: item.prodiId
        });
        setIsDialogOpen(true);
    };

    const visiList = visiMisiList.filter(v => v.tipe === 'visi');
    const misiList = visiMisiList.filter(v => v.tipe === 'misi');

    return (
        <DashboardPage title="Visi & Misi Program Studi" description="Kelola Visi dan Misi sebagai landasan kurikulum OBE">
            <div className="space-y-6">
                {/* Filter Prodi (Admin Only) */}
                {role === "admin" && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Label>Pilih Program Studi:</Label>
                                <Select value={selectedProdi} onValueChange={setSelectedProdi}>
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
                        </CardContent>
                    </Card>
                )}

                {/* VISI SECTION */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Visi Keilmuan</CardTitle>
                            <CardDescription>Cita-cita luhur program studi di masa depan</CardDescription>
                        </div>
                        {canEdit && visiList.length === 0 && (
                            <Button size="sm" onClick={() => {
                                setEditingItem(null);
                                setFormData({ teks: "", tipe: "visi", urutan: 1, prodiId: selectedProdi });
                                setIsDialogOpen(true);
                            }}>
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
                                {canEdit && (
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
                        {canEdit && (
                            <Button size="sm" onClick={() => {
                                setEditingItem(null);
                                setFormData({ teks: "", tipe: "misi", urutan: misiList.length + 1, prodiId: selectedProdi });
                                setIsDialogOpen(true);
                            }}>
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
                                        {canEdit && (
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                                <Label>Teks {formData.tipe === 'visi' ? 'Visi' : 'Misi'}</Label>
                                <Textarea
                                    value={formData.teks}
                                    onChange={(e) => setFormData({ ...formData, teks: e.target.value })}
                                    rows={5}
                                    placeholder={`Masukkan bunyi ${formData.tipe}...`}
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
