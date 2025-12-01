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
    });

    // Level Taksonomi mapping
    const levelTaksonomiMap: { [key: string]: string } = {
        "C1": "Mengingat",
        "C2": "Memahami", 
        "C3": "Menerapkan",
        "C4": "Menganalisis",
        "C5": "Mengevaluasi",
        "C6": "Mencipta",
        "P1": "Persepsi",
        "P2": "Respon",
        "P3": "Penilaian",
        "P4": "Organisasi",
        "P5": "Karakterisasi",
        "A1": "Menerima",
        "A2": "Merespons", 
        "A3": "Menghargai",
        "A4": "Mengelola",
        "A5": "Menginternalisasi",
        "K1": "Mengingat",
        "K2": "Memahami",
        "K3": "Menerapkan",
        "K4": "Menganalisis", 
        "K5": "Mengevaluasi",
        "K6": "Mencipta"
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
            fetchAvailableCpl();
        }
    }, [id]);

    const fetchCpmkDetail = async () => {
        try {
            const result = await api.get(`/cpmk/${id}`);
            setCpmk(result.data);
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

    const fetchAvailableCpl = async () => {
        try {
            const result = await api.get('/cpl');
            setAvailableCpl(result.data || []);
        } catch (error) {
            console.error('Error fetching CPL:', error);
        }
    };

    // Calculate total bobot
    const totalBobotMapping = cplMappings.reduce((sum, m) => sum + Number(m.bobotPersentase), 0);
    const totalBobotTeknik = teknikPenilaian.reduce((sum, t) => sum + Number(t.bobotPersentase), 0);

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
                });
                toast.success("Teknik penilaian berhasil diupdate");
            } else {
                await api.post('/teknik-penilaian', {
                    cpmkId: id,
                    namaTeknik: teknikForm.namaTeknik.trim(),
                    bobotPersentase: parseFloat(teknikForm.bobotPersentase),
                    deskripsi: teknikForm.deskripsi.trim() || null,
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
        });
        setTeknikDialogOpen(true);
    };

    const resetTeknikForm = () => {
        setTeknikForm({ namaTeknik: "", bobotPersentase: "", deskripsi: "" });
        setEditingTeknik(null);
    };

    // Filter available CPL (exclude already mapped)
    const mappedCplIds = new Set(cplMappings.map(m => m.cpl.id));
    const unmappedCpl = availableCpl.filter(cpl => !mappedCplIds.has(cpl.id));

    // Suggested teknik penilaian names
    const suggestedTeknik = [
        "Tes tertulis",
        "Observasi",
        "Angket",
        "Unjuk kerja",
        "Praktikum",
        "Presentasi",
        "Project",
        "Tugas",
        "Kuis"
    ];

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
                                    </DialogHeader>
                                    <form onSubmit={handleSubmitTeknik} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="namaTeknik">Nama Teknik Penilaian</Label>
                                            <Input
                                                id="namaTeknik"
                                                placeholder="Contoh: Tes tertulis, Observasi"
                                                value={teknikForm.namaTeknik}
                                                onChange={(e) => setTeknikForm({ ...teknikForm, namaTeknik: e.target.value })}
                                                list="suggested-teknik"
                                                required
                                            />
                                            <datalist id="suggested-teknik">
                                                {suggestedTeknik.map((teknik) => (
                                                    <option key={teknik} value={teknik} />
                                                ))}
                                            </datalist>
                                        </div>
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
