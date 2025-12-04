import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface RubrikLevel {
    id?: string;
    deskripsi: string;
    nilai: number;
    label: string;
}

interface RubrikKriteria {
    id?: string;
    deskripsi: string;
    bobot: number;
    levels: RubrikLevel[];
}

interface RubrikData {
    id?: string;
    cpmkId: string;
    deskripsi: string;
    kriteria: RubrikKriteria[];
}

export default function RubrikManager() {
    const { cpmkId } = useParams<{ cpmkId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cpmkData, setCpmkData] = useState<any>(null);

    const [rubrik, setRubrik] = useState<RubrikData>({
        cpmkId: cpmkId || "",
        deskripsi: "",
        kriteria: []
    });

    useEffect(() => {
        if (cpmkId) {
            fetchData();
        }
    }, [cpmkId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch CPMK info
            const cpmkRes = await api.get(`/cpmk/${cpmkId}`);
            setCpmkData(cpmkRes.data);

            // Fetch existing Rubrik
            const rubrikRes = await api.get(`/rubrik/${cpmkId}`);
            if (rubrikRes.data) {
                setRubrik(rubrikRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Gagal memuat data");
        }
        finally {
            setLoading(false);
        }
    };

    const handleAddKriteria = () => {
        setRubrik(prev => ({
            ...prev,
            kriteria: [
                ...prev.kriteria,
                {
                    deskripsi: "",
                    bobot: 1,
                    levels: [
                        { deskripsi: "Sangat Baik", nilai: 100, label: "A" },
                        { deskripsi: "Baik", nilai: 80, label: "B" },
                        { deskripsi: "Cukup", nilai: 60, label: "C" },
                        { deskripsi: "Kurang", nilai: 40, label: "D" }
                    ]
                }
            ]
        }));
    };

    const handleRemoveKriteria = (index: number) => {
        setRubrik(prev => ({
            ...prev,
            kriteria: prev.kriteria.filter((_, i) => i !== index)
        }));
    };

    const updateKriteria = (index: number, field: keyof RubrikKriteria, value: any) => {
        setRubrik(prev => {
            const newKriteria = [...prev.kriteria];
            newKriteria[index] = { ...newKriteria[index], [field]: value };
            return { ...prev, kriteria: newKriteria };
        });
    };

    const updateLevel = (kriteriaIndex: number, levelIndex: number, field: keyof RubrikLevel, value: any) => {
        setRubrik(prev => {
            const newKriteria = [...prev.kriteria];
            const newLevels = [...newKriteria[kriteriaIndex].levels];
            newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
            newKriteria[kriteriaIndex] = { ...newKriteria[kriteriaIndex], levels: newLevels };
            return { ...prev, kriteria: newKriteria };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate
            if (rubrik.kriteria.length === 0) {
                toast.error("Minimal harus ada 1 kriteria");
                setSaving(false);
                return;
            }

            await api.post("/rubrik", {
                cpmkId: cpmkId,
                deskripsi: rubrik.deskripsi,
                kriteria: rubrik.kriteria
            });
            toast.success("Rubrik berhasil disimpan");
            navigate(-1); // Go back
        } catch (error) {
            console.error("Error saving rubrik:", error);
            toast.error("Gagal menyimpan rubrik");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Memuat...</div>;

    return (
        <DashboardPage
            title="Kelola Rubrik Penilaian"
            description={`Rubrik untuk CPMK: ${cpmkData?.kodeCpmk} - ${cpmkData?.mataKuliah?.namaMk}`}
        >
            <div className="space-y-6 pb-20">
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Deskripsi Umum Rubrik</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Deskripsi atau petunjuk umum penggunaan rubrik ini..."
                            value={rubrik.deskripsi || ""}
                            onChange={e => setRubrik({ ...rubrik, deskripsi: e.target.value })}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kriteria Penilaian</h3>
                    <Button onClick={handleAddKriteria}>
                        <Plus className="w-4 h-4 mr-2" /> Tambah Kriteria
                    </Button>
                </div>

                {rubrik.kriteria.map((kriteria, kIndex) => (
                    <Card key={kIndex} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="flex-1 space-y-2">
                                    <Label>Deskripsi Kriteria</Label>
                                    <Textarea
                                        value={kriteria.deskripsi}
                                        onChange={e => updateKriteria(kIndex, 'deskripsi', e.target.value)}
                                        placeholder="Contoh: Kelengkapan analisis..."
                                    />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Bobot (%)</Label>
                                    <Input
                                        type="number"
                                        value={kriteria.bobot}
                                        onChange={e => updateKriteria(kIndex, 'bobot', parseFloat(e.target.value))}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive mt-8"
                                    onClick={() => handleRemoveKriteria(kIndex)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-lg">
                                <Label className="mb-2 block">Level Penilaian (Skala)</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {kriteria.levels.map((level, lIndex) => (
                                        <div key={lIndex} className="bg-card p-3 rounded border space-y-2">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-sm">{level.label}</span>
                                                <Input
                                                    type="number"
                                                    className="w-20 h-8 text-right"
                                                    value={level.nilai}
                                                    onChange={e => updateLevel(kIndex, lIndex, 'nilai', parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <Textarea
                                                className="h-20 text-xs resize-none"
                                                value={level.deskripsi}
                                                onChange={e => updateLevel(kIndex, lIndex, 'deskripsi', e.target.value)}
                                                placeholder="Deskripsi level..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {rubrik.kriteria.length === 0 && (
                    <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                        Belum ada kriteria. Klik "Tambah Kriteria" untuk memulai.
                    </div>
                )}
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6">
                <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-lg">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Menyimpan..." : "Simpan Rubrik"}
                </Button>
            </div>
        </DashboardPage>
    );
}
