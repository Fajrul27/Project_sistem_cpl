import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPage } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchRubrik, saveRubrik, api } from "@/lib/api-client";
import { Trash2, Plus, Save, ArrowLeft, AlertCircle, Info } from "lucide-react";

const RubrikManager = () => {
    const { cpmkId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cpmkInfo, setCpmkInfo] = useState<any>(null);

    const [deskripsi, setDeskripsi] = useState("");
    const [kriteria, setKriteria] = useState<any[]>([
        {
            deskripsi: "Kriteria 1",
            bobot: 100,
            levels: [
                { deskripsi: "Sangat Baik", nilai: 100, label: "Sangat Baik" },
                { deskripsi: "Baik", nilai: 80, label: "Baik" },
                { deskripsi: "Cukup", nilai: 60, label: "Cukup" },
                { deskripsi: "Kurang", nilai: 40, label: "Kurang" },
            ]
        }
    ]);

    useEffect(() => {
        if (cpmkId) {
            loadData();
        }
    }, [cpmkId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch CPMK Info
            const cpmkRes = await api.get(`/cpmk/${cpmkId}`);
            if (cpmkRes.data) {
                setCpmkInfo(cpmkRes.data);
            }

            // Fetch Existing Rubrik
            try {
                const rubrikRes = await fetchRubrik(cpmkId!);
                if (rubrikRes.data) {
                    setDeskripsi(rubrikRes.data.deskripsi || "");
                    if (rubrikRes.data.kriteria && rubrikRes.data.kriteria.length > 0) {
                        setKriteria(rubrikRes.data.kriteria.map((k: any) => ({
                            ...k,
                            bobot: Number(k.bobot),
                            levels: k.levels.map((l: any) => ({
                                ...l,
                                nilai: Number(l.nilai)
                            }))
                        })));
                    }
                }
            } catch (err) {
                // Ignore 404 (No rubric yet)
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddKriteria = () => {
        const remainingBobot = 100 - getTotalBobot();
        setKriteria([
            ...kriteria,
            {
                deskripsi: "Kriteria Baru",
                bobot: Math.max(0, remainingBobot),
                levels: [
                    { deskripsi: "Sangat Baik", nilai: 100, label: "Sangat Baik" },
                    { deskripsi: "Baik", nilai: 75, label: "Baik" },
                    { deskripsi: "Cukup", nilai: 50, label: "Cukup" },
                ]
            }
        ]);
    };

    const handleRemoveKriteria = (index: number) => {
        if (kriteria.length <= 1) {
            toast.error("Minimal harus ada 1 kriteria");
            return;
        }
        const newKriteria = [...kriteria];
        newKriteria.splice(index, 1);
        setKriteria(newKriteria);
    };

    const handleUpdateKriteria = (index: number, field: string, value: any) => {
        const newKriteria = [...kriteria];
        newKriteria[index] = { ...newKriteria[index], [field]: value };
        setKriteria(newKriteria);
    };

    const handleUpdateLevel = (kIndex: number, lIndex: number, field: string, value: any) => {
        const newKriteria = [...kriteria];
        const newLevels = [...newKriteria[kIndex].levels];
        newLevels[lIndex] = { ...newLevels[lIndex], [field]: value };
        newKriteria[kIndex].levels = newLevels;
        setKriteria(newKriteria);
    };

    const handleAddLevel = (kIndex: number) => {
        const newKriteria = [...kriteria];
        newKriteria[kIndex].levels.push({ deskripsi: "Level Baru", nilai: 0, label: "Label" });
        setKriteria(newKriteria);
    };

    const handleRemoveLevel = (kIndex: number, lIndex: number) => {
        if (kriteria[kIndex].levels.length <= 1) {
            toast.error("Minimal harus ada 1 level per kriteria");
            return;
        }
        const newKriteria = [...kriteria];
        newKriteria[kIndex].levels.splice(lIndex, 1);
        setKriteria(newKriteria);
    };

    const getTotalBobot = () => {
        return kriteria.reduce((sum, k) => sum + Number(k.bobot || 0), 0);
    };

    const validateRubrik = () => {
        const totalBobot = getTotalBobot();
        if (Math.abs(totalBobot - 100) > 0.1) {
            toast.error(`Total bobot harus 100%. Saat ini: ${totalBobot.toFixed(1)}%`);
            return false;
        }

        for (let i = 0; i < kriteria.length; i++) {
            if (!kriteria[i].deskripsi.trim()) {
                toast.error(`Kriteria ${i + 1}: Deskripsi tidak boleh kosong`);
                return false;
            }
            if (kriteria[i].levels.length === 0) {
                toast.error(`Kriteria ${i + 1}: Harus memiliki minimal 1 level`);
                return false;
            }
            for (let j = 0; j < kriteria[i].levels.length; j++) {
                const level = kriteria[i].levels[j];
                if (!level.label.trim() || !level.deskripsi.trim()) {
                    toast.error(`Kriteria ${i + 1}, Level ${j + 1}: Label dan deskripsi tidak boleh kosong`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateRubrik()) {
            return;
        }

        try {
            setSaving(true);

            await saveRubrik({
                cpmkId,
                deskripsi,
                kriteria
            });

            toast.success("Rubrik berhasil disimpan");
            navigate(-1);
        } catch (error: any) {
            toast.error(error.message || "Gagal menyimpan rubrik");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Memuat rubrik...</p>
                </div>
            </div>
        );
    }

    const totalBobot = getTotalBobot();
    const isBobotValid = Math.abs(totalBobot - 100) < 0.1;

    return (
        <DashboardPage
            title={`Rubrik Penilaian: ${cpmkInfo?.kodeCpmk || '...'}`}
            description={`${cpmkInfo?.mataKuliah?.namaMk || '...'} - ${cpmkInfo?.deskripsi || '...'}`}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Rubrik"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 max-w-6xl mx-auto pb-20">
                {/* Info Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Rubrik digunakan untuk memberikan penilaian terstruktur dengan kriteria dan level yang jelas.
                        Total bobot semua kriteria harus <strong>100%</strong>.
                    </AlertDescription>
                </Alert>

                {/* Bobot Summary */}
                <Card className={!isBobotValid ? "border-destructive" : "border-green-500"}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Total Bobot Kriteria</CardTitle>
                            <Badge variant={isBobotValid ? "default" : "destructive"} className="text-lg px-4 py-1">
                                {totalBobot.toFixed(1)}%
                            </Badge>
                        </div>
                        {!isBobotValid && (
                            <CardDescription className="text-destructive flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Total bobot harus tepat 100%
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>

                {/* Deskripsi Rubrik */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deskripsi Rubrik</CardTitle>
                        <CardDescription>Penjelasan umum tentang rubrik penilaian ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Contoh: Rubrik ini digunakan untuk menilai kualitas laporan praktikum berdasarkan kelengkapan, ketepatan, dan penyajian..."
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            rows={3}
                        />
                    </CardContent>
                </Card>

                {/* Kriteria List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Kriteria Penilaian</h3>
                        <Button size="sm" onClick={handleAddKriteria}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Kriteria
                        </Button>
                    </div>

                    {kriteria.map((krit, kIndex) => (
                        <Card key={kIndex} className="border-l-4 border-l-primary shadow-md">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-base px-3 py-1">
                                            Kriteria {kIndex + 1}
                                        </Badge>
                                        <Badge variant="secondary" className="text-base px-3 py-1">
                                            Bobot: {krit.bobot}%
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveKriteria(kIndex)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3 space-y-2">
                                        <Label>Deskripsi Kriteria</Label>
                                        <Textarea
                                            value={krit.deskripsi}
                                            onChange={(e) => handleUpdateKriteria(kIndex, 'deskripsi', e.target.value)}
                                            placeholder="Contoh: Kelengkapan Jawaban - Mencakup semua aspek yang diminta"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bobot (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={krit.bobot}
                                            onChange={(e) => handleUpdateKriteria(kIndex, 'bobot', parseFloat(e.target.value))}
                                            className="text-lg font-semibold"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Levels */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">Level Penilaian</Label>
                                        <Button variant="outline" size="sm" onClick={() => handleAddLevel(kIndex)}>
                                            <Plus className="h-3 w-3 mr-1" /> Tambah Level
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {krit.levels.map((lvl: any, lIndex: number) => (
                                            <div key={lIndex} className="flex gap-2 items-center bg-muted/50 p-3 rounded-lg border">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {lIndex + 1}
                                                </div>
                                                <Input
                                                    className="w-32"
                                                    placeholder="Label"
                                                    value={lvl.label}
                                                    onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'label', e.target.value)}
                                                />
                                                <Input
                                                    className="flex-1"
                                                    placeholder="Deskripsi level..."
                                                    value={lvl.deskripsi}
                                                    onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'deskripsi', e.target.value)}
                                                />
                                                <Input
                                                    className="w-20 text-center font-semibold"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    placeholder="Nilai"
                                                    value={lvl.nilai}
                                                    onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'nilai', parseFloat(e.target.value))}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveLevel(kIndex, lIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardPage>
    );
};

export default RubrikManager;
