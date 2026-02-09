import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEvaluasiMK } from "@/hooks/useEvaluasiMK";
import { FloatingBackButton } from "@/components/common/FloatingBackButton";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { usePermission } from "@/contexts/PermissionContext";


export default function EvaluasiMataKuliah() {
    const { can } = usePermission();
    const canManage = can('access', 'kaprodi') || can('access', 'admin');

    const {
        evaluasi,
        setEvaluasi,
        loading,
        saving,
        handleSave,
        navigate,
        isKaprodi,
        isDosen,
        currentSemester,
        currentTahunAjaran
    } = useEvaluasiMK();

    if (loading) return <div className="p-8 text-center">Memuat...</div>;

    return (
        <DashboardPage
            title="Evaluasi Mata Kuliah (CQI)"
            description={`Evaluasi Akhir Semester & Rencana Perbaikan`}
        >
            <FloatingBackButton>
                <div className="space-y-6 max-w-4xl pb-20">
                    {canManage && (
                        <CollapsibleGuide title="Panduan Evaluasi MK (CQI)">
                            <div className="space-y-3">
                                <p>Halaman ini digunakan oleh Dosen untuk merefleksikan proses pembelajaran dan oleh Kaprodi untuk memberikan feedback perbaikan.</p>
                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                    <li><strong>Dosen:</strong> Mengisi kendala dan rencana perbaikan untuk mata kuliah yang diampu pada semester ini.</li>
                                    <li><strong>Kaprodi:</strong> Memberikan feedback atau catatan atas rencana perbaikan yang diajukan oleh dosen.</li>
                                    <li><strong>Siklus CQI:</strong> Data ini menjadi bagian penting dalam proses penjaminan mutu kurikulum (Continuous Quality Improvement).</li>
                                </ul>
                            </div>
                        </CollapsibleGuide>
                    )}

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Laporan Evaluasi Dosen</CardTitle>
                                <CardDescription>
                                    Semester {currentSemester} - {currentTahunAjaran}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Kendala yang dihadapi selama perkuliahan</Label>
                                    <Textarea
                                        placeholder="Jelaskan kendala teknis, materi, atau mahasiswa..."
                                        value={evaluasi.kendala}
                                        onChange={e => setEvaluasi({ ...evaluasi, kendala: e.target.value })}
                                        rows={4}
                                        disabled={!isDosen && isKaprodi} // Kaprodi read-only here
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-primary font-bold">Rencana Perbaikan (Continuous Improvement)</Label>
                                    <Textarea
                                        placeholder="Apa yang akan diperbaiki untuk semester depan? (Metode, Materi, Asesmen, dll)"
                                        value={evaluasi.rencanaPerbaikan}
                                        onChange={e => setEvaluasi({ ...evaluasi, rencanaPerbaikan: e.target.value })}
                                        rows={5}
                                        className="border-primary/20 bg-primary/5"
                                        disabled={!isDosen && isKaprodi}
                                    />
                                </div>

                                {evaluasi.dosen && (
                                    <div className="text-sm text-muted-foreground text-right">
                                        Dibuat oleh: {evaluasi.dosen.profile?.namaLengkap}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Kaprodi Feedback Section */}
                        {(isKaprodi || (isDosen && evaluasi.feedbackKaprodi)) && (
                            <Card className={isKaprodi ? "border-orange-200 bg-orange-50/30" : ""}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-orange-500" />
                                        Review & Feedback Kaprodi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Catatan / Masukan Kaprodi</Label>
                                        <Textarea
                                            placeholder="Berikan masukan untuk perbaikan..."
                                            value={evaluasi.feedbackKaprodi || ""}
                                            onChange={e => setEvaluasi({ ...evaluasi, feedbackKaprodi: e.target.value })}
                                            rows={4}
                                            disabled={!isKaprodi} // Dosen read-only here
                                        />
                                    </div>
                                    {evaluasi.status === 'reviewed' && (
                                        <div className="mt-4 flex justify-end">
                                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                                Sudah Direview
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </FloatingBackButton>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6">
                <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-lg">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Menyimpan..." : (isKaprodi ? "Kirim Feedback" : "Simpan Evaluasi")}
                </Button>
            </div>
        </DashboardPage>
    );
}
