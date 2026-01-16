import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEvaluasiMK } from "@/hooks/useEvaluasiMK";

export default function EvaluasiMataKuliah() {
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
            <div className="flex gap-6 relative">
                {/* Back Button Side Column */}
                <div className="hidden xl:block w-28 shrink-0 relative">
                    <div className="fixed left-80 top-1/2 -translate-y-1/2 z-40">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full shadow-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 h-12 w-12 transition-all hover:scale-105"
                            onClick={() => navigate(-1)}
                            title="Kembali"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 space-y-6 max-w-4xl pb-20">
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
            </div>

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
