import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Plus, Edit, Trash2, ArrowLeft, AlertCircle, BookOpen, User, Hash, GraduationCap, Eye } from "lucide-react";
import { LoadingScreen, LoadingSpinner } from "@/components/common/LoadingScreen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { DashboardPage } from "@/components/layout/DashboardLayout";
import { useCPMKDetail, CplMapping, TeknikPenilaian } from "@/hooks/useCPMKDetail";

const CPMKDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { role } = useUserRole();
    const canEdit = role === "admin" || role === "dosen";

    const {
        cpmk,
        cplMappings,
        teknikPenilaian,
        availableCpl,
        subCpmkList,
        levelTaksonomiMap,
        loading,
        submitting,
        initializeData,
        saveMapping,
        deleteMapping,
        saveTeknik,
        deleteTeknik,
        saveSubCpmk,
        deleteSubCpmk,
        saveSubCpmkMapping,
        deleteSubCpmkMapping,
        teknikRefs
    } = useCPMKDetail(id);

    // Local UI State for Dialogs
    const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState<CplMapping | null>(null);
    const [mappingForm, setMappingForm] = useState({ cplId: "", bobotPersentase: "" });

    const [teknikDialogOpen, setTeknikDialogOpen] = useState(false);
    const [editingTeknik, setEditingTeknik] = useState<TeknikPenilaian | null>(null);
    const [teknikForm, setTeknikForm] = useState({ namaTeknik: "", bobotPersentase: "", deskripsi: "", teknikRefId: "" });

    const [isSubCpmkDialogOpen, setIsSubCpmkDialogOpen] = useState(false);
    const [currentSubCpmk, setCurrentSubCpmk] = useState<any>(null);
    const [subCpmkForm, setSubCpmkForm] = useState({ kode: '', deskripsi: '', bobot: '' });

    const [isSubCpmkMappingDialogOpen, setIsSubCpmkMappingDialogOpen] = useState(false);
    const [currentSubCpmkForMapping, setCurrentSubCpmkForMapping] = useState<any>(null);
    const [subCpmkMappingForm, setSubCpmkMappingForm] = useState({ teknikPenilaianId: "", bobot: "100" });

    // Confirmation dialog for technique update
    const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);
    const [pendingTeknikUpdate, setPendingTeknikUpdate] = useState<any>(null);

    // Helper: Get count of Sub-CPMK mapped to a technique
    const getMappedSubCpmkCount = (teknikId: string): number => {
        return subCpmkList.filter(sub =>
            sub.asesmenMappings?.some((m: any) => m.teknikPenilaianId === teknikId)
        ).length;
    };

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    // Handlers
    const handleSubmitMapping = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await saveMapping(mappingForm, editingMapping?.id);
        if (success) {
            setMappingDialogOpen(false);
            setMappingForm({ cplId: "", bobotPersentase: "" });
            setEditingMapping(null);
        }
    };

    const handleSubmitTeknik = async (e: React.FormEvent) => {
        e.preventDefault();

        // If editing and technique has mappings, show confirmation
        if (editingTeknik?.id) {
            const mappedCount = getMappedSubCpmkCount(editingTeknik.id);
            if (mappedCount > 0) {
                setPendingTeknikUpdate({ form: teknikForm, editId: editingTeknik.id, mappedCount });
                setShowUpdateConfirmation(true);
                return;
            }
        }

        // Proceed with save if no mappings
        await proceedWithTeknikUpdate();
    };

    const proceedWithTeknikUpdate = async () => {
        const form = pendingTeknikUpdate?.form || teknikForm;
        const editId = pendingTeknikUpdate?.editId || editingTeknik?.id;

        const success = await saveTeknik(form, editId);
        if (success) {
            setTeknikDialogOpen(false);
            setTeknikForm({ namaTeknik: "", bobotPersentase: "", deskripsi: "", teknikRefId: "" });
            setEditingTeknik(null);
            setShowUpdateConfirmation(false);
            setPendingTeknikUpdate(null);
        }
    };

    const handleSaveSubCpmk = async () => {
        // Validation: Total weight max 100
        const newBobot = Number(subCpmkForm.bobot);
        const currentTotal = subCpmkList.reduce((sum, item) => {
            if (currentSubCpmk && item.id === currentSubCpmk.id) return sum;
            return sum + Number(item.bobot);
        }, 0);

        if (currentTotal + newBobot > 100) {
            // "saat ini" should reflect the total weight BEFORE the edit (existing state).
            // currentTotal is "Sum of Others".
            // If editing, existing state total = currentTotal + (currentSubCpmk.bobot).
            // If adding, existing state total = currentTotal.
            const displayTotal = currentSubCpmk ? (currentTotal + Number(currentSubCpmk.bobot)) : currentTotal;
            toast.error(`Total bobot akan melebihi 100% (saat ini: ${displayTotal.toFixed(2)}%)`);
            return;
        }

        const success = await saveSubCpmk(subCpmkForm, currentSubCpmk?.id);
        if (success) {
            setIsSubCpmkDialogOpen(false);
            setSubCpmkForm({ kode: '', deskripsi: '', bobot: '' });
            setCurrentSubCpmk(null);
        }
    };

    const handleSaveSubCpmkMapping = async () => {
        if (!subCpmkMappingForm.teknikPenilaianId) {
            toast.error("Pilih teknik penilaian");
            return;
        }
        const success = await saveSubCpmkMapping(currentSubCpmkForMapping.id, subCpmkMappingForm.teknikPenilaianId, subCpmkMappingForm.bobot);
        if (success) {
            setIsSubCpmkMappingDialogOpen(false);
        }
    };

    // Helper
    const getLevelTaksonomiDeskripsi = (level: string | null) => {
        if (!level) return "-";
        return levelTaksonomiMap[level] || level;
    };

    // Filter available CPL (exclude already mapped)
    const mappedCplIds = new Set(cplMappings.map(m => m.cpl.id));
    const unmappedCpl = availableCpl.filter(cpl => !mappedCplIds.has(cpl.id));

    // Calculations
    const totalBobotMapping = cplMappings.reduce((sum, m) => sum + Number(m.bobotPersentase), 0);
    const totalBobotTeknik = teknikPenilaian.reduce((sum, t) => sum + Number(t.bobotPersentase), 0);
    const totalBobotSubCpmk = subCpmkList.reduce((sum, s) => sum + Number(s.bobot), 0);

    if (loading || !cpmk) {
        return (
            <DashboardPage title="Detail CPMK">
                <LoadingScreen fullScreen={false} message="Memuat detail CPMK..." />
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
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kode CPMK</CardTitle>
                            <Hash className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{cpmk.kodeCpmk}</div>
                            <p className="text-xs text-muted-foreground">Identifikasi CPMK</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-400" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Level Taksonomi</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
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
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold leading-tight truncate">
                                {cpmk.creator?.profile?.namaLengkap || cpmk.creator?.email || "-"}
                            </div>
                            <p className="text-xs text-muted-foreground">Pembuat CPMK</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Deskripsi */}
                <Card>
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

                {/* CPL Mapping */}
                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle>Mapping CPMK - CPL</CardTitle>
                            <CardDescription>
                                Total Bobot: {totalBobotMapping.toFixed(2)}% / 100%
                            </CardDescription>
                            <Progress value={totalBobotMapping} className="w-full mt-2" />
                        </div>
                        {canEdit && (
                            <Button size="sm" onClick={() => navigate(`/dashboard/cpmk?view=matrix&mkId=${cpmk.mataKuliahId}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Mapping
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
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
                                            <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">Belum ada mapping</TableCell>
                                        </TableRow>
                                    ) : (
                                        cplMappings.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>{m.cpl.kodeCpl}</TableCell>
                                                <TableCell>{m.cpl.deskripsi}</TableCell>
                                                <TableCell className="text-right">{Number(m.bobotPersentase).toFixed(2)}%</TableCell>
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => { setEditingMapping(m); setMappingForm({ cplId: m.cpl.id, bobotPersentase: m.bobotPersentase.toString() }); setMappingDialogOpen(true); }}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => deleteMapping(m.id)}>
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

                {/* Teknik Penilaian */}
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
                            <>
                                <Dialog open={teknikDialogOpen} onOpenChange={setTeknikDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" onClick={() => {
                                            setTeknikForm({ namaTeknik: "", bobotPersentase: "", deskripsi: "", teknikRefId: "" });
                                            setEditingTeknik(null);
                                        }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Teknik
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingTeknik ? "Edit Teknik Penilaian" : "Tambah Teknik Penilaian"}</DialogTitle>
                                            <DialogDescription>
                                                Tambahkan atau edit metode penilaian untuk CPMK ini (contoh: UTS, UAS, Tugas Besar).
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmitTeknik} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Referensi Teknik (Opsional)</Label>
                                                <Select
                                                    value={teknikForm.teknikRefId}
                                                    onValueChange={(val) => {
                                                        const ref = teknikRefs.find(r => r.id === val);
                                                        setTeknikForm({
                                                            ...teknikForm,
                                                            teknikRefId: val,
                                                            namaTeknik: ref ? ref.nama : teknikForm.namaTeknik,
                                                            deskripsi: ref ? (ref.deskripsi || "") : teknikForm.deskripsi
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Pilih Jenis Teknik" /></SelectTrigger>
                                                    <SelectContent>
                                                        {teknikRefs.map(r => (
                                                            <SelectItem key={r.id} value={r.id}>{r.nama}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Nama Teknik</Label>
                                                <Input
                                                    value={teknikForm.namaTeknik}
                                                    onChange={(e) => setTeknikForm({ ...teknikForm, namaTeknik: e.target.value })}
                                                    placeholder="Contoh: UTS, Tugas Besar"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bobot (%)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={teknikForm.bobotPersentase}
                                                    onChange={(e) => setTeknikForm({ ...teknikForm, bobotPersentase: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Deskripsi</Label>
                                                <Input
                                                    value={teknikForm.deskripsi}
                                                    onChange={(e) => setTeknikForm({ ...teknikForm, deskripsi: e.target.value })}
                                                />
                                            </div>
                                            <Button type="submit" disabled={submitting}>
                                                {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                                {editingTeknik ? "Update" : "Simpan"}
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showUpdateConfirmation} onOpenChange={setShowUpdateConfirmation}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Update Teknik Penilaian</DialogTitle>
                                            <DialogDescription>
                                                Teknik penilaian ini memiliki {pendingTeknikUpdate?.mappedCount} Sub-CPMK yang sudah ter-mapping.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
                                                Peringatan
                                            </AlertTitle>
                                            <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                                                Jika Anda melanjutkan update, semua mapping assessment untuk {pendingTeknikUpdate?.mappedCount} Sub-CPMK akan <strong>dihapus otomatis</strong>.
                                                Anda perlu melakukan mapping ulang setelah update.
                                            </AlertDescription>
                                        </Alert>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setShowUpdateConfirmation(false);
                                                    setPendingTeknikUpdate(null);
                                                }}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                onClick={proceedWithTeknikUpdate}
                                                disabled={submitting}
                                            >
                                                {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                                OK, Lanjutkan Update
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
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
                                        <TableRow><TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">Belum ada teknik penilaian</TableCell></TableRow>
                                    ) : (
                                        teknikPenilaian.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>{t.namaTeknik}</TableCell>
                                                <TableCell>{t.deskripsi || "-"}</TableCell>
                                                <TableCell className="text-right">{Number(t.bobotPersentase).toFixed(2)}%</TableCell>
                                                {canEdit && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => {
                                                                setEditingTeknik(t);
                                                                setTeknikForm({
                                                                    namaTeknik: t.namaTeknik,
                                                                    bobotPersentase: t.bobotPersentase.toString(),
                                                                    deskripsi: t.deskripsi || "",
                                                                    teknikRefId: t.teknikRefId || ""
                                                                });
                                                                setTeknikDialogOpen(true);
                                                            }}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => deleteTeknik(t.id)}>
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

                {/* Sub-CPMK */}
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
                        <div className="overflow-x-auto">
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
                                    {subCpmkList.length === 0 ? (
                                        <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="text-center text-muted-foreground">Belum ada Sub-CPMK</TableCell></TableRow>
                                    ) : (
                                        subCpmkList.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>{sub.kode}</TableCell>
                                                <TableCell>{sub.deskripsi}</TableCell>
                                                <TableCell>{Number(sub.bobot).toFixed(2)}%</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {sub.asesmenMappings && sub.asesmenMappings.length > 0 ? (
                                                            sub.asesmenMappings.map((m: any) => (
                                                                <div key={m.id} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded-md justify-between group">
                                                                    <span>{m.teknikPenilaian?.namaTeknik} ({Number(m.bobot)}%)</span>
                                                                    {canEdit && (
                                                                        <button onClick={() => deleteSubCpmkMapping(m.id)} className="text-red-500 hover:text-red-700">
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
                                                                className="h-6 text-xs justify-start px-0 text-blue-600"
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
                                                            <Button variant="destructive" size="sm" onClick={() => deleteSubCpmk(sub.id)}>
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

                {/* Dialogs for Sub CPMK */}
                <Dialog open={isSubCpmkDialogOpen} onOpenChange={setIsSubCpmkDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{currentSubCpmk ? "Edit Sub-CPMK" : "Tambah Sub-CPMK"}</DialogTitle>
                            <DialogDescription>
                                Definisikan detail Sub-CPMK sebagai indikator kinerja spesifik.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveSubCpmk(); }} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Kode Sub-CPMK</Label>
                                <Input
                                    value={subCpmkForm.kode}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, kode: e.target.value })}
                                    placeholder="Contoh: Sub-CPMK-1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deskripsi</Label>
                                <Input
                                    value={subCpmkForm.deskripsi}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, deskripsi: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Bobot (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={subCpmkForm.bobot}
                                    onChange={(e) => setSubCpmkForm({ ...subCpmkForm, bobot: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                                {currentSubCpmk ? "Update" : "Simpan"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isSubCpmkMappingDialogOpen} onOpenChange={setIsSubCpmkMappingDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Mapping Sub-CPMK ke Teknik Penilaian</DialogTitle>
                            <DialogDescription>
                                Tentukan teknik penilaian mana yang digunakan untuk mengukur Sub-CPMK ini.
                            </DialogDescription>
                        </DialogHeader>
                        {(() => {
                            // Calculate limits
                            const subCpmkTotalUsed = currentSubCpmkForMapping?.asesmenMappings?.reduce((sum: number, m: any) => sum + Number(m.bobot), 0) || 0;
                            const subCpmkLimit = Number(currentSubCpmkForMapping?.bobot || 0);
                            const sisaSub = subCpmkLimit - subCpmkTotalUsed;

                            // Calculate limit for selected technique
                            let sisaTeknik = 100;
                            let teknikName = "";

                            if (subCpmkMappingForm.teknikPenilaianId) {
                                const selectedTeknik = teknikPenilaian.find(t => t.id === subCpmkMappingForm.teknikPenilaianId);
                                if (selectedTeknik) {
                                    teknikName = selectedTeknik.namaTeknik;
                                    const teknikLimit = Number(selectedTeknik.bobotPersentase);

                                    // Calculate used weight for this technique across ALL Sub-CPMKs
                                    // We need to iterate over all subCpmkList and their mappings
                                    const teknikUsed = subCpmkList.reduce((total, sub) => {
                                        const mapping = sub.asesmenMappings?.find((m: any) => m.teknikPenilaianId === subCpmkMappingForm.teknikPenilaianId);
                                        return total + (mapping ? Number(mapping.bobot) : 0);
                                    }, 0);

                                    sisaTeknik = teknikLimit - teknikUsed;
                                }
                            }

                            const maxInput = Math.min(sisaSub, subCpmkMappingForm.teknikPenilaianId ? sisaTeknik : 100);
                            const currentInput = Number(subCpmkMappingForm.bobot);
                            const isValid = subCpmkMappingForm.teknikPenilaianId && currentInput > 0 && currentInput <= maxInput;

                            return (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Teknik Penilaian</Label>
                                        <Select value={subCpmkMappingForm.teknikPenilaianId} onValueChange={(val) => setSubCpmkMappingForm({ ...subCpmkMappingForm, teknikPenilaianId: val })}>
                                            <SelectTrigger><SelectValue placeholder="Pilih Teknik" /></SelectTrigger>
                                            <SelectContent>
                                                {teknikPenilaian.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.namaTeknik} ({t.bobotPersentase}%)</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {subCpmkMappingForm.teknikPenilaianId && (
                                        <div className="text-xs space-y-1 bg-muted p-2 rounded-md">
                                            <div className="flex justify-between">
                                                <span>Sisa Bobot Sub-CPMK:</span>
                                                <span className={sisaSub < 0 ? "text-red-500 font-bold" : "font-medium"}>{sisaSub.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sisa Bobot Teknik ({teknikName}):</span>
                                                <span className={sisaTeknik < 0 ? "text-red-500 font-bold" : "font-medium"}>{sisaTeknik.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1 mt-1">
                                                <span className="font-semibold">Maksimum Input:</span>
                                                <span className="font-bold text-blue-600">{Math.max(0, maxInput).toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Bobot Pengukuran (%)</Label>
                                        <Input
                                            type="number"
                                            value={subCpmkMappingForm.bobot}
                                            onChange={(e) => setSubCpmkMappingForm({ ...subCpmkMappingForm, bobot: e.target.value })}
                                            className={!isValid && subCpmkMappingForm.teknikPenilaianId ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        />
                                        {!isValid && subCpmkMappingForm.teknikPenilaianId && (
                                            <p className="text-xs text-red-500">
                                                {currentInput <= 0 ? "Bobot harus lebih dari 0" : `Bobot tidak boleh melebihi ${Math.max(0, maxInput).toFixed(2)}%`}
                                            </p>
                                        )}
                                    </div>
                                    <Button onClick={handleSaveSubCpmkMapping} disabled={submitting || !isValid}>Simpan</Button>
                                </div>
                            );
                        })()}
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardPage>
    );
};

export default CPMKDetailPage;
