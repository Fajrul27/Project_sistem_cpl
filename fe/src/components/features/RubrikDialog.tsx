import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchRubrik, saveRubrik, api } from "@/lib/api";
import { Trash2, Plus, Save, Info, AlertCircle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RubrikDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cpmkId: string;
    cpmkInfo?: any;
}

export const RubrikDialog = ({ open, onOpenChange, cpmkId, cpmkInfo }: RubrikDialogProps) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [deskripsi, setDeskripsi] = useState("");
    const [kriteria, setKriteria] = useState<any[]>([
        {
            deskripsi: "Kriteria 1",
            bobot: 100,
            levels: [
                { deskripsi: "Sangat Baik", nilai: 100, label: "Sangat Baik" },
                { deskripsi: "Baik", nilai: 80, label: "Baik" },
                { deskripsi: "Cukup", nilai: 60, label: "Cukup" },
            ]
        }
    ]);

    useEffect(() => {
        if (open && cpmkId) {
            loadData();
        }
    }, [open, cpmkId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch Existing Rubrik
            try {
                const rubrikRes = await fetchRubrik(cpmkId);
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
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || "Gagal menyimpan rubrik");
        } finally {
            setSaving(false);
        }
    };

    const totalBobot = getTotalBobot();
    const isBobotValid = Math.abs(totalBobot - 100) < 0.1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Rubrik: {cpmkInfo?.kodeCpmk || '...'}
                    </DialogTitle>
                    <DialogDescription>
                        {cpmkInfo?.mataKuliah?.namaMk || '...'} - Atur kriteria dan level penilaian untuk CPMK ini
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                    <div className="space-y-4">
                        {/* Info Alert */}
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                Rubrik ini akan digunakan untuk <strong>semua teknik penilaian</strong> yang mengukur CPMK ini. Total bobot harus <strong>100%</strong>.
                            </AlertDescription>
                        </Alert>

                        {/* Bobot Summary */}
                        <Card className={!isBobotValid ? "border-destructive" : "border-green-500"}>
                            <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Total Bobot</CardTitle>
                                    <Badge variant={isBobotValid ? "default" : "destructive"} className="text-base px-3">
                                        {totalBobot.toFixed(1)}%
                                    </Badge>
                                </div>
                                {!isBobotValid && (
                                    <CardDescription className="text-destructive flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3" />
                                        Harus tepat 100%
                                    </CardDescription>
                                )}
                            </CardHeader>
                        </Card>

                        {/* Deskripsi */}
                        <div className="space-y-2">
                            <Label>Deskripsi Rubrik (Opsional)</Label>
                            <Textarea
                                placeholder="Penjelasan umum rubrik untuk CPMK ini..."
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Kriteria */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Kriteria Penilaian</Label>
                                <Button size="sm" variant="outline" onClick={handleAddKriteria}>
                                    <Plus className="mr-1 h-4 w-4" /> Tambah
                                </Button>
                            </div>

                            {kriteria.map((krit, kIndex) => (
                                <Card key={kIndex} className="border-l-4 border-l-primary">
                                    <CardHeader className="py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">#{kIndex + 1}</Badge>
                                                <Badge variant="secondary">{krit.bobot}%</Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive h-7"
                                                onClick={() => handleRemoveKriteria(kIndex)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="col-span-3">
                                                <Input
                                                    value={krit.deskripsi}
                                                    onChange={(e) => handleUpdateKriteria(kIndex, 'deskripsi', e.target.value)}
                                                    placeholder="Nama kriteria"
                                                />
                                            </div>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={krit.bobot}
                                                onChange={(e) => handleUpdateKriteria(kIndex, 'bobot', parseFloat(e.target.value))}
                                                placeholder="Bobot %"
                                            />
                                        </div>

                                        <Separator />

                                        {/* Levels */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">Level Penilaian</Label>
                                                <Button variant="ghost" size="sm" className="h-6" onClick={() => handleAddLevel(kIndex)}>
                                                    <Plus className="h-3 w-3 mr-1" /> Level
                                                </Button>
                                            </div>

                                            {krit.levels.map((lvl: any, lIndex: number) => (
                                                <div key={lIndex} className="flex gap-2 items-center bg-muted/30 p-2 rounded">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                                        {lIndex + 1}
                                                    </span>
                                                    <Input
                                                        className="w-24 h-8"
                                                        placeholder="Label"
                                                        value={lvl.label}
                                                        onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'label', e.target.value)}
                                                    />
                                                    <Input
                                                        className="flex-1 h-8"
                                                        placeholder="Deskripsi"
                                                        value={lvl.deskripsi}
                                                        onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'deskripsi', e.target.value)}
                                                    />
                                                    <Input
                                                        className="w-16 h-8 text-center"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={lvl.nilai}
                                                        onChange={(e) => handleUpdateLevel(kIndex, lIndex, 'nilai', parseFloat(e.target.value))}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleRemoveLevel(kIndex, lIndex)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
