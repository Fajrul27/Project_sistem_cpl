import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api, getUser } from "@/lib/api-client";
import { toast } from "sonner";
import { Save, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";

interface EvaluasiData {
    id?: string;
    mataKuliahId: string;
    semester: number;
    tahunAjaran: string;
    kendala: string;
    rencanaPerbaikan: string;
    status: string;
    feedbackKaprodi?: string;
    dosen?: {
        profile?: {
            namaLengkap: string;
        }
    }
}

export default function EvaluasiMataKuliah() {
    const { mataKuliahId } = useParams<{ mataKuliahId: string }>();
    const navigate = useNavigate();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mkData, setMkData] = useState<any>(null);

    // Default current semester/year (should be dynamic in real app)
    const currentSemester = 1;
    const currentTahunAjaran = "2024/2025";

    const [evaluasi, setEvaluasi] = useState<EvaluasiData>({
        mataKuliahId: mataKuliahId || "",
        semester: currentSemester,
        tahunAjaran: currentTahunAjaran,
        kendala: "",
        rencanaPerbaikan: "",
        status: "submitted"
    });

    useEffect(() => {
        if (mataKuliahId) {
            fetchData();
        }
    }, [mataKuliahId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch MK info
            // Since we don't have a direct endpoint for single MK by ID easily accessible without filters, 
            // we might need to rely on the list or add a specific endpoint. 
            // For now, let's assume we can get it from the list or a new endpoint.
            // Actually, let's try to get it from the evaluasi endpoint context if possible, 
            // or just fetch from /mata-kuliah with ID filter if supported.
            // A simple workaround is to fetch the evaluation first.

            const res = await api.get(`/evaluasi/mata-kuliah/${mataKuliahId}`, {
                params: { semester: currentSemester, tahunAjaran: currentTahunAjaran }
            });

            if (res.data && res.data.length > 0) {
                // Use the latest evaluation
                setEvaluasi(res.data[0]);
            }

            // Fetch MK details for title (optional, can be passed via state)
            // const mkRes = await api.get(`/mata-kuliah/${mataKuliahId}`); // If this existed
        } catch (error) {
            console.error("Error fetching evaluasi:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (!evaluasi.rencanaPerbaikan) {
                toast.error("Rencana perbaikan wajib diisi");
                setSaving(false);
                return;
            }

            if (role === 'kaprodi' && evaluasi.id) {
                // Kaprodi Review Mode
                await api.put(`/evaluasi/${evaluasi.id}/review`, {
                    feedbackKaprodi: evaluasi.feedbackKaprodi
                });
                toast.success("Feedback berhasil dikirim");
            } else {
                // Dosen Submit Mode
                await api.post("/evaluasi", {
                    mataKuliahId,
                    semester: currentSemester,
                    tahunAjaran: currentTahunAjaran,
                    kendala: evaluasi.kendala,
                    rencanaPerbaikan: evaluasi.rencanaPerbaikan
                });
                toast.success("Evaluasi berhasil disimpan");
            }
            navigate(-1);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan data");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Memuat...</div>;

    const isKaprodi = role === 'kaprodi' || role === 'admin';
    const isDosen = role === 'dosen';

    return (
        <DashboardPage
            title="Evaluasi Mata Kuliah (CQI)"
            description={`Evaluasi Akhir Semester & Rencana Perbaikan`}
        >
            <div className="space-y-6 max-w-4xl mx-auto pb-20">
                <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                </Button>

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
