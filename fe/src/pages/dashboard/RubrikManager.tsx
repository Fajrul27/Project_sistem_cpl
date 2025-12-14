import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useRubrik } from "@/hooks/useRubrik";

export default function RubrikManager() {
    const {
        rubrik,
        cpmkData,
        loading,
        saving,
        navigate,
        handleAddKriteria,
        handleRemoveKriteria,
        updateKriteria,
        updateLevel,
        handleSave,
        setRubrikDeskripsi
    } = useRubrik();

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
                            onChange={e => setRubrikDeskripsi(e.target.value)}
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
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="w-full sm:flex-1 space-y-2">
                                    <Label>Deskripsi Kriteria</Label>
                                    <Textarea
                                        value={kriteria.deskripsi}
                                        onChange={e => updateKriteria(kIndex, 'deskripsi', e.target.value)}
                                        placeholder="Contoh: Kelengkapan analisis..."
                                    />
                                </div>
                                <div className="w-full sm:w-32 space-y-2">
                                    <Label>Bobot (%)</Label>
                                    <Input
                                        type="number"
                                        value={kriteria.bobot}
                                        onChange={e => updateKriteria(kIndex, 'bobot', parseFloat(e.target.value))}
                                    />
                                </div>
                                <div className="self-end sm:self-start pt-0 sm:pt-8">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => handleRemoveKriteria(kIndex)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
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
