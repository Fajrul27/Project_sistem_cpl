import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, ArrowLeft, AlertCircle, BookOpen, User, Hash, GraduationCap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/DashboardLayout";

import { api } from "@/lib/api-client";

interface Cpmk {
    id: string;
    kodeCpmk: string;
    deskripsi: string | null;
    levelTaksonomi: string | null;
    mataKuliah: {
        kodeMk: string;
        namaMk: string;
        prodiId?: string;
    };
    creator?: {
        email: string;
        profile?: {
            namaLengkap: string | null;
        };
    };
}

interface CplMapping {
    id: string;
    bobotPersentase: number;
    cpl: {
        id: string;
        kodeCpl: string;
        deskripsi: string;
        kategori: string | null;
    };
}

interface TeknikPenilaian {
    id: string;
    namaTeknik: string;
    bobotPersentase: number;
    deskripsi: string | null;
    teknikRefId?: string | null;
}

interface TeknikPenilaianRef {
    id: string;
    nama: string;
    deskripsi: string | null;
}

interface Cpl {
    id: string;
    kodeCpl: string;
    deskripsi: string;
    kategori: string | null;
}

const CPMKDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { role } = useUserRole();

    const [cpmk, setCpmk] = useState<Cpmk | null>(null);
    const [cplMappings, setCplMappings] = useState<CplMapping[]>([]);
    const [teknikPenilaian, setTeknikPenilaian] = useState<TeknikPenilaian[]>([]);
    const [teknikRefs, setTeknikRefs] = useState<TeknikPenilaianRef[]>([]);
    const [availableCpl, setAvailableCpl] = useState<Cpl[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Mapping dialog states
    const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState<CplMapping | null>(null);
    const [mappingForm, setMappingForm] = useState({
        cplId: "",
        bobotPersentase: "",
    });

    // Teknik penilaian dialog states
    const [teknikDialogOpen, setTeknikDialogOpen] = useState(false);
    const [editingTeknik, setEditingTeknik] = useState<TeknikPenilaian | null>(null);
    const [teknikForm, setTeknikForm] = useState({
        namaTeknik: "",
        bobotPersentase: "",
        deskripsi: "",
        teknikRefId: "",
    });

    // Level Taksonomi mapping
    const [levelTaksonomiMap, setLevelTaksonomiMap] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchLevelTaksonomi();
    }, []);

    const fetchLevelTaksonomi = async () => {
        try {
            const result = await api.get('/level-taksonomi');
            const data = result.data || [];
            const map: { [key: string]: string } = {};
            data.forEach((item: any) => {
                map[item.kode] = item.deskripsi;
            });
            setLevelTaksonomiMap(map);
        } catch (error) {
            console.error('Error fetching level taksonomi:', error);
        }
    };

    // Sub-CPMK State
    const [subCpmkList, setSubCpmkList] = useState<any[]>([]);
    const [isSubCpmkDialogOpen, setIsSubCpmkDialogOpen] = useState(false);
    const [currentSubCpmk, setCurrentSubCpmk] = useState<any>(null);
    const [subCpmkForm, setSubCpmkForm] = useState({ kode: '', deskripsi: '', bobot: '' });

    const fetchSubCpmk = async () => {
        if (!id) return;
        try {
            const res = await api.get(`/sub-cpmk?cpmkId=${id}`);
            setSubCpmkList(res.data);
        } catch (error) {
            console.error("Error fetching sub-cpmk:", error);
        }
    };

    const handleSaveSubCpmk = async () => {
        try {
            if (currentSubCpmk) {
                await api.put(`/sub-cpmk/${currentSubCpmk.id}`, {
                    ...subCpmkForm,
                    bobot: parseFloat(subCpmkForm.bobot) || 0
                });
                toast.success("Sub-CPMK berhasil diperbarui");
            } else {
                await api.post(`/sub-cpmk?cpmkId=${id}`, {
                    ...subCpmkForm,
                    bobot: parseFloat(subCpmkForm.bobot) || 0
                });
                toast.success("Sub-CPMK berhasil ditambahkan");
            }
            setIsSubCpmkDialogOpen(false);
            fetchSubCpmk();
            setSubCpmkForm({ kode: '', deskripsi: '', bobot: '' });
            setCurrentSubCpmk(null);
        } catch (error) {
            console.error("Error saving sub-cpmk:", error);
            toast.error("Gagal menyimpan Sub-CPMK");
        }
    };

    const handleDeleteSubCpmk = async (subId: string) => {
        if (!confirm("Yakin ingin menghapus Sub-CPMK ini?")) return;
        try {
            await api.delete(`/sub-cpmk/${subId}`);
            toast.success("Sub-CPMK berhasil dihapus");
            fetchSubCpmk();
        } catch (error) {
            console.error("Error deleting sub-cpmk:", error);
            toast.error("Gagal menghapus Sub-CPMK");
        }
    };

    // Sub-CPMK Mapping State
    const [isSubCpmkMappingDialogOpen, setIsSubCpmkMappingDialogOpen] = useState(false);
    const [currentSubCpmkForMapping, setCurrentSubCpmkForMapping] = useState<any>(null);
    const [subCpmkMappingForm, setSubCpmkMappingForm] = useState({ teknikPenilaianId: "", bobot: "100" });

    const handleSaveSubCpmkMapping = async () => {
        if (!subCpmkMappingForm.teknikPenilaianId) {
            toast.error("Pilih teknik penilaian");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/sub-cpmk/mapping', {
                subCpmkId: currentSubCpmkForMapping.id,
                teknikPenilaianId: subCpmkMappingForm.teknikPenilaianId,
                bobot: subCpmkMappingForm.bobot
            });
            toast.success("Mapping berhasil disimpan");
            setIsSubCpmkMappingDialogOpen(false);
            fetchSubCpmk();
        } catch (error) {
            console.error("Error saving mapping:", error);
            toast.error("Gagal menyimpan mapping");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubCpmkMapping = async (mappingId: string) => {
        if (!confirm("Hapus mapping ini?")) return;
        try {
            await api.delete(`/sub-cpmk/mapping/${mappingId}`);
            toast.success("Mapping dihapus");
            fetchSubCpmk();
        } catch (error) {
            console.error("Error deleting mapping:", error);
            toast.error("Gagal menghapus mapping");
        }
    };

    const getLevelTaksonomiDeskripsi = (level: string | null) => {
        if (!level) return "-";
        return levelTaksonomiMap[level] || level;
    };

    const canEdit = role === "admin" || role === "dosen";

    useEffect(() => {
        if (id) {
            fetchCpmkDetail();
            fetchCplMappings();
            fetchTeknikPenilaian();
            fetchTeknikRefs();
            // fetchAvailableCpl will be called after we have the CPMK data
            fetchSubCpmk();
        }
    }, [id]);

    const fetchCpmkDetail = async () => {
        try {
            const result = await api.get(`/cpmk/${id}`);
            setCpmk(result.data);

            // Fetch CPL available for this Prodi
            if (result.data?.mataKuliah?.prodiId) {
                fetchAvailableCpl(result.data.mataKuliah.prodiId);
            } else {
                fetchAvailableCpl();
            }
        } catch (error) {
            console.error('Error fetching CPMK:', error);
            toast.error('Gagal memuat data CPMK');
        } finally {
            setLoading(false);
        }
    };

    const fetchCplMappings = async () => {
        try {
            const result = await api.get(`/cpmk-mapping/cpmk/${id}`);
            setCplMappings(result.data || []);
        } catch (error) {
            console.error('Error fetching mappings:', error);
            toast.error('Gagal memuat data mapping');
        }
    };

    const fetchTeknikPenilaian = async () => {
        try {
            const result = await api.get(`/teknik-penilaian/cpmk/${id}`);
            setTeknikPenilaian(result.data || []);
        } catch (error) {
            console.error('Error fetching teknik penilaian:', error);
            toast.error('Gagal memuat teknik penilaian');
        }
    };

    const fetchTeknikRefs = async () => {
        try {
            const result = await api.get('/teknik-penilaian-ref');
            setTeknikRefs(result.data || []);
        } catch (error) {
            console.error('Error fetching teknik refs:', error);
        }
    };

    const fetchAvailableCpl = async (prodiId?: string) => {
        try {
            const params = prodiId ? { prodiId } : {};
            const result = await api.get('/cpl', { params });
            setAvailableCpl(result.data || []);
        } catch (error) {
            console.error('Error fetching CPL:', error);
        }
    };

    // Calculate total bobot
    const totalBobotMapping = cplMappings.reduce((sum, m) => sum + Number(m.bobotPersentase), 0);
    const totalBobotTeknik = teknikPenilaian.reduce((sum, t) => sum + Number(t.bobotPersentase), 0);
    const totalBobotSubCpmk = subCpmkList.reduce((sum, s) => sum + Number(s.bobot), 0);

    // Handle CPL Mapping
    const handleSubmitMapping = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mappingForm.cplId || !mappingForm.bobotPersentase) {
            toast.error("CPL dan Bobot harus diisi");
            return;
        }

        setSubmitting(true);

        try {
            if (editingMapping) {
                await api.put(`/cpmk-mapping/${editingMapping.id}`, {
                    bobotPersentase: parseFloat(mappingForm.bobotPersentase),
                });
                toast.success("Mapping berhasil diupdate");
            } else {
                await api.post('/cpmk-mapping', {
                    cpmkId: id,
                    cplId: mappingForm.cplId,
                    bobotPersentase: parseFloat(mappingForm.bobotPersentase),
                });
                toast.success("Mapping berhasil ditambahkan");
            }

            resetMappingForm();
            await fetchCplMappings();
            setMappingDialogOpen(false);
        } catch (error) {
            console.error('Error saving mapping:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMapping = async (mappingId: string) => {
        if (!confirm("Yakin ingin menghapus mapping ini?")) return;

        try {
            await api.delete(`/cpmk-mapping/${mappingId}`);
            toast.success("Mapping berhasil dihapus");
            await fetchCplMappings();
        } catch (error) {
            console.error('Error deleting mapping:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    const handleEditMapping = (mapping: CplMapping) => {
        setEditingMapping(mapping);
        setMappingForm({
            cplId: mapping.cpl.id,
            bobotPersentase: mapping.bobotPersentase.toString(),
        });
        setMappingDialogOpen(true);
    };

    const resetMappingForm = () => {
        setMappingForm({ cplId: "", bobotPersentase: "" });
        setEditingMapping(null);
    };

    // Handle Teknik Penilaian
    const handleSubmitTeknik = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!teknikForm.namaTeknik || !teknikForm.bobotPersentase) {
            toast.error("Nama teknik dan bobot harus diisi");
            return;
        }

        setSubmitting(true);

        try {
            if (editingTeknik) {
                await api.put(`/teknik-penilaian/${editingTeknik.id}`, {
                    namaTeknik: teknikForm.namaTeknik.trim(),
                    bobotPersentase: parseFloat(teknikForm.bobotPersentase),
                    deskripsi: teknikForm.deskripsi.trim() || null,
                    teknikRefId: teknikForm.teknikRefId || null,
                });
                toast.success("Teknik penilaian berhasil diupdate");
            } else {
                await api.post('/teknik-penilaian', {
                    cpmkId: id,
                    namaTeknik: teknikForm.namaTeknik.trim(),
                    bobotPersentase: parseFloat(teknikForm.bobotPersentase),
                    deskripsi: teknikForm.deskripsi.trim() || null,
                    teknikRefId: teknikForm.teknikRefId || null,
                });
                toast.success("Teknik penilaian berhasil ditambahkan");
            }

            resetTeknikForm();
            await fetchTeknikPenilaian();
            setTeknikDialogOpen(false);
        } catch (error) {
            console.error('Error saving teknik:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTeknik = async (teknikId: string) => {
        if (!confirm("Yakin ingin menghapus teknik penilaian ini?")) return;

        try {
            await api.delete(`/teknik-penilaian/${teknikId}`);
            toast.success("Teknik penilaian berhasil dihapus");
            await fetchTeknikPenilaian();
        } catch (error) {
            console.error('Error deleting teknik:', error);
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
    };

    const handleEditTeknik = (teknik: TeknikPenilaian) => {
        setEditingTeknik(teknik);
        setTeknikForm({
            namaTeknik: teknik.namaTeknik,
            bobotPersentase: teknik.bobotPersentase.toString(),
            deskripsi: teknik.deskripsi || "",
            teknikRefId: teknik.teknikRefId || "",
        });
        setTeknikDialogOpen(true);
    };

    const resetTeknikForm = () => {
        setTeknikForm({ namaTeknik: "", bobotPersentase: "", deskripsi: "", teknikRefId: "" });
        setEditingTeknik(null);
    };

    // Filter available CPL (exclude already mapped)
    const mappedCplIds = new Set(cplMappings.map(m => m.cpl.id));
    const unmappedCpl = availableCpl.filter(cpl => !mappedCplIds.has(cpl.id));

    if (loading || !cpmk) {
        return (
            <DashboardPage title="Detail CPMK">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage
            title={`Detail CPMK: ${cpmk.kodeCpmk}`}
            description={`${cpmk.mataKuliah.kodeMk} - ${cpmk.mataKuliah.namaMk}`}
        >
            <div className="space-y-6">
                <Button variant="outline" onClick={() => navigate('/dashboard/cpmk')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar CPMK
                </Button>

                {/* Info Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Kode CPMK Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kode CPMK</CardTitle>
                            <Hash className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cpmk.kodeCpmk}</div>
                            <p className="text-xs text-muted-foreground">Identifikasi CPMK</p>
                        </CardContent>
                    </Card>

                    {/* Level Taksonomi Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Level Taksonomi</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground group-hover:text-orange-600 group-hover:scale-110 transition-all duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{getLevelTaksonomiDeskripsi(cpmk.levelTaksonomi)}</div>
                            <p className="text-xs text-muted-foreground">{cpmk.levelTaksonomi || "-"}</p>
                        </CardContent>
                    </Card>

                    {/* Mata Kuliah Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mata Kuliah</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold leading-tight">{cpmk.mataKuliah.kodeMk}</div>
                            <p className="text-xs text-muted-foreground">{cpmk.mataKuliah.namaMk}</p>
                        </CardContent>
                    </Card>

                    {/* Pembuat Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-400" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dibuat Oleh</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:scale-110 transition-all duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold leading-tight truncate">
                                {cpmk.creator?.profile?.namaLengkap || cpmk.creator?.email || "-"}
                            </div>
                            <p className="text-xs text-muted-foreground">Pembuat CPMK</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Deskripsi Card */}
                <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-green-600" />
                            Deskripsi CPMK
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm leading-relaxed">
                                {cpmk.deskripsi || "Tidak ada deskripsi untuk CPMK ini."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 1: CPL Mapping */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Mapping CPMK ke CPL</CardTitle>
                            <CardDescription>
                                Total Bobot: {totalBobotMapping.toFixed(2)}% / 100%
                            </CardDescription>
                            <Progress value={totalBobotMapping} className="w-full mt-2" />
                        </div>
                        {canEdit && (
                            <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => { resetMappingForm(); setMappingDialogOpen(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Mapping
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingMapping ? "Edit Mapping CPL" : "Tambah Mapping CPL"}</DialogTitle>
                                        <DialogDescription>
                                            {editingMapping ? "Edit bobot mapping CPL yang sudah ada." : "Tambahkan mapping baru antara CPMK dan CPL."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmitMapping} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cplId">CPL</Label>
                                            <Select
                                                value={mappingForm.cplId}
                                                onValueChange={(value) => setMappingForm({ ...mappingForm, cplId: value })}
                                                disabled={!!editingMapping}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih CPL" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {editingMapping ? (
                                                        <SelectItem value={editingMapping.cpl.id}>
                                                            {editingMapping.cpl.kodeCpl} - {editingMapping.cpl.deskripsi}
                                                        </SelectItem>
                                                    ) : (
                                                        unmappedCpl.map((cpl) => (
                                                            <SelectItem key={cpl.id} value={cpl.id}>
                                                                {cpl.kodeCpl} - {cpl.deskripsi}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bobotMapping">Kontribusi CPMK ini ke CPL (%)</Label>
                                            <Input
                                                id="bobotMapping"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="Contoh: 25"
                                                value={mappingForm.bobotPersentase}
                                                onChange={(e) => setMappingForm({ ...mappingForm, bobotPersentase: e.target.value })}
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Seberapa besar peran CPMK ini dalam membentuk nilai CPL yang dipilih?
                                                <br />
                                                Total kontribusi dari semua CPMK untuk CPL ini akan dinormalisasi.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" className="flex-1" disabled={submitting}>
                                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                {editingMapping ? "Update" : "Simpan"}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setMappingDialogOpen(false)}>
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        {totalBobotMapping !== 100 && totalBobotMapping > 0 && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Informasi Normalisasi</AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    Total bobot saat ini {totalBobotMapping.toFixed(2)}%.
                                    Sistem akan otomatis menormalisasi bobot ini ke skala 100% saat perhitungan nilai.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode CPL</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">Bobot (%)</TableHead>
                                    {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cplMappings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">
                                            Belum ada mapping CPL
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cplMappings.map((mapping) => (
                                        <TableRow key={mapping.id}>
                                            <TableCell className="font-medium">{mapping.cpl.kodeCpl}</TableCell>
                                            <TableCell className="max-w-md">{mapping.cpl.deskripsi}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(mapping.bobotPersentase).toFixed(2)}%
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEditMapping(mapping)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteMapping(mapping.id)}>
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
                    </CardContent>
                </Card>

                {/* Section 1.5: Sub-CPMK */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Sub-CPMK</CardTitle>
                            <CardDescription>
                                Total Bobot: {totalBobotSubCpmk.toFixed(2)}% / 100%
                            </CardDescription>
                            <Progress value={totalBobotSubCpmk} className="w-full mt-2" />
                        </div>
                        {canEdit && (
                            <Button onClick={() => {
                                setCurrentSubCpmk(null);
                                setSubCpmkForm({ kode: '', deskripsi: '', bobot: '' });
                                setIsSubCpmkDialogOpen(true);
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Tambah Sub-CPMK
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Bobot (%)</TableHead>
                                    <TableHead>Mapping Asesmen</TableHead>
                                    {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(subCpmkList || []).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 5 : 4} className="text-center py-4 text-muted-foreground">Belum ada Sub-CPMK</TableCell>
                                    </TableRow>
                                ) : (
                                    subCpmkList.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">{sub.kode}</TableCell>
                                            <TableCell className="max-w-md">{sub.deskripsi}</TableCell>
                                            <TableCell>{Number(sub.bobot).toFixed(2)}%</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {sub.asesmenMappings && sub.asesmenMappings.length > 0 ? (
                                                        sub.asesmenMappings.map((m: any) => (
                                                            <div key={m.id} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded-md justify-between group">
                                                                <span>{m.teknikPenilaian?.namaTeknik} ({Number(m.bobot)}%)</span>
                                                                {canEdit && (
                                                                    <button
                                                                        onClick={() => handleDeleteSubCpmkMapping(m.id)}
                                                                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded p-0.5"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Belum ada mapping</span>
                                                    )}
                                                    {canEdit && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-xs justify-start px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent"
                                                            onClick={() => {
                                                                setCurrentSubCpmkForMapping(sub);
                                                                setSubCpmkMappingForm({ teknikPenilaianId: "", bobot: "100" });
                                                                setIsSubCpmkMappingDialogOpen(true);
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" /> Tambah Mapping
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => {
                                                            setCurrentSubCpmk(sub);
                                                            setSubCpmkForm({ kode: sub.kode, deskripsi: sub.deskripsi, bobot: sub.bobot.toString() });
                                                            setIsSubCpmkDialogOpen(true);
                                                        }}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSubCpmk(sub.id)}>
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
                    </CardContent>
                </Card>

                {/* Sub-CPMK Mapping Dialog */}
                <Dialog open={isSubCpmkMappingDialogOpen} onOpenChange={setIsSubCpmkMappingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mapping Sub-CPMK ke Teknik Penilaian</DialogTitle>
                            <DialogDescription>
                                Hubungkan {currentSubCpmkForMapping?.kode} dengan teknik penilaian.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Teknik Penilaian</Label>
                                <Select
                                    value={subCpmkMappingForm.teknikPenilaianId}
                                    onValueChange={(val) => setSubCpmkMappingForm({ ...subCpmkMappingForm, teknikPenilaianId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Teknik Penilaian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teknikPenilaian.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.namaTeknik} ({t.bobotPersentase}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Bobot Kontribusi (%)</Label>
                                <Input
                                    type="number"
                                    value={subCpmkMappingForm.bobot}
                                    onChange={(e) => setSubCpmkMappingForm({ ...subCpmkMappingForm, bobot: e.target.value })}
                                    placeholder="100"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Berapa persen nilai teknik ini berkontribusi ke Sub-CPMK ini? (Biasanya 100%)
                                </p>
                            </div>
                            <Button onClick={handleSaveSubCpmkMapping} className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Simpan Mapping
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSubCpmkDialogOpen} onOpenChange={setIsSubCpmkDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentSubCpmk ? 'Edit Sub-CPMK' : 'Tambah Sub-CPMK'}</DialogTitle>
                            <DialogDescription>
                                {currentSubCpmk ? 'Edit detail Sub-CPMK yang sudah ada.' : 'Tambahkan Sub-CPMK baru untuk CPMK ini.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Kode Sub-CPMK</Label>
                                <Input
                                    placeholder="Contoh: Sub-CPMK-1.1"
                                    value={subCpmkForm.kode}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, kode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <Textarea
                                    placeholder="Deskripsi kemampuan..."
                                    value={subCpmkForm.deskripsi}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, deskripsi: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bobot (Opsional)</Label>
                                <Input
                                    type="number"
                                    value={subCpmkForm.bobot}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, bobot: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleSaveSubCpmk} className="w-full">Simpan</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Section 2: Teknik Penilaian */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Teknik Penilaian</CardTitle>
                            <CardDescription>
                                Total Bobot: {totalBobotTeknik.toFixed(2)}% / 100%
                            </CardDescription>
                            <Progress value={totalBobotTeknik} className="w-full mt-2" />
                        </div>
                        {canEdit && (
                            <Dialog open={teknikDialogOpen} onOpenChange={setTeknikDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" onClick={() => { resetTeknikForm(); setTeknikDialogOpen(true); }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Teknik
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingTeknik ? "Edit Teknik Penilaian" : "Tambah Teknik Penilaian"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {editingTeknik ? "Edit detail teknik penilaian." : "Tambahkan teknik penilaian baru untuk CPMK ini."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmitTeknik} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="jenisTeknik">Jenis Teknik Penilaian</Label>
                                            <Select
                                                value={teknikForm.teknikRefId || (teknikForm.namaTeknik && !teknikRefs.find(r => r.nama === teknikForm.namaTeknik) ? "custom" : "")}
                                                onValueChange={(val) => {
                                                    if (val === "custom") {
                                                        setTeknikForm({ ...teknikForm, teknikRefId: "", namaTeknik: "" });
                                                    } else {
                                                        const ref = teknikRefs.find(r => r.id === val);
                                                        if (ref) {
                                                            setTeknikForm({
                                                                ...teknikForm,
                                                                teknikRefId: ref.id,
                                                                namaTeknik: ref.nama,
                                                                deskripsi: ref.deskripsi || teknikForm.deskripsi
                                                            });
                                                        }
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih jenis teknik..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {teknikRefs.map((ref) => (
                                                        <SelectItem key={ref.id} value={ref.id}>
                                                            {ref.nama}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="custom">Lainnya (Custom)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {(!teknikForm.teknikRefId) && (
                                            <div className="space-y-2">
                                                <Label htmlFor="namaTeknik">Nama Teknik (Custom)</Label>
                                                <Input
                                                    id="namaTeknik"
                                                    placeholder="Contoh: Kuis Dadakan"
                                                    value={teknikForm.namaTeknik}
                                                    onChange={(e) => setTeknikForm({ ...teknikForm, namaTeknik: e.target.value })}
                                                    required={!teknikForm.teknikRefId}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="bobotTeknik">Bobot Persentase (%)</Label>
                                            <Input
                                                id="bobotTeknik"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                placeholder="0-100"
                                                value={teknikForm.bobotPersentase}
                                                onChange={(e) => setTeknikForm({ ...teknikForm, bobotPersentase: e.target.value })}
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Bobot saat ini: {totalBobotTeknik.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="deskripsiTeknik">Deskripsi (Opsional)</Label>
                                            <Textarea
                                                id="deskripsiTeknik"
                                                placeholder="Deskripsi teknik penilaian"
                                                value={teknikForm.deskripsi}
                                                onChange={(e) => setTeknikForm({ ...teknikForm, deskripsi: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" className="flex-1" disabled={submitting}>
                                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                {editingTeknik ? "Update" : "Simpan"}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setTeknikDialogOpen(false)}>
                                                Batal
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardHeader>
                    <CardContent>
                        {totalBobotTeknik !== 100 && totalBobotTeknik > 0 && (
                            <Alert className="mb-4 bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Informasi Normalisasi</AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    Total bobot saat ini {totalBobotTeknik.toFixed(2)}%.
                                    Sistem akan otomatis menormalisasi bobot ini ke skala 100% saat perhitungan nilai.
                                </AlertDescription>
                            </Alert>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Teknik</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">Bobot (%)</TableHead>
                                    {canEdit && <TableHead className="text-right">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teknikPenilaian.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">
                                            Belum ada teknik penilaian
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teknikPenilaian.map((teknik) => (
                                        <TableRow key={teknik.id}>
                                            <TableCell className="font-medium">{teknik.namaTeknik}</TableCell>
                                            <TableCell className="max-w-md">{teknik.deskripsi || "-"}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {Number(teknik.bobotPersentase).toFixed(2)}%
                                            </TableCell>
                                            {canEdit && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => handleEditTeknik(teknik)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTeknik(teknik.id)}>
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
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
};

export default CPMKDetailPage;
