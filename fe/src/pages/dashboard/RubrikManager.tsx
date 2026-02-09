import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RequiredLabel } from "@/components/common/RequiredLabel";
import { Plus, Trash2, Save } from "lucide-react";
import { useRubrik } from "@/hooks/useRubrik";
import { FloatingBackButton } from "@/components/common/FloatingBackButton";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";


export default function RubrikManager() {
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');

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
            <FloatingBackButton>
                <div className="space-y-6 pb-20 min-w-0">
                    {canManage && (
                        <CollapsibleGuide title="Panduan Rubrik Penilaian">
                            <div className="space-y-3">
                                <p>Rubrik membantu dosen dalam memberikan penilaian yang konsisten dan membantu mahasiswa memahami standar pencapaian.</p>
                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                    <li><strong>Kriteria:</strong> Aspek-aspek yang dinilai pada satu CPMK (contoh: Logika Progam, Kreativitas, dsb).</li>
                                    <li><strong>Bobot:</strong> Persentase kontribusi kriteria terhadap nilai CPMK (Total harus 100%).</li>
                                    <li><strong>Level:</strong> Deskripsi kualitatif perolehan nilai (Sangat Baik, Baik, dsb) untuk setiap kriteria.</li>
                                </ul>
                            </div>
                        </CollapsibleGuide>
                    )}


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
                                        <RequiredLabel required>Deskripsi Kriteria</RequiredLabel>
                                        <Textarea
                                            value={kriteria.deskripsi}
                                            onChange={e => updateKriteria(kIndex, 'deskripsi', e.target.value)}
                                            placeholder="Contoh: Kelengkapan analisis..."
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-32 space-y-2">
                                        <RequiredLabel required>Bobot (%)</RequiredLabel>
                                        <Input
                                            type="number"
                                            value={kriteria.bobot}
                                            onChange={e => updateKriteria(kIndex, 'bobot', parseFloat(e.target.value))}
                                            required
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
            </FloatingBackButton>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6">
                <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-lg">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Menyimpan..." : "Simpan Rubrik"}
                </Button>
            </div>
        </DashboardPage >
    );
}
