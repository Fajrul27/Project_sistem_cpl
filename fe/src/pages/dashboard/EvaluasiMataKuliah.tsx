import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardPage } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchEvaluasiMataKuliah, submitEvaluasiMataKuliah, api } from "@/lib/api-client";
import { Save, ArrowLeft, History } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const EvaluasiMataKuliah = () => {
    const { mataKuliahId } = useParams();
    const navigate = useNavigate();
    const { role } = useUserRole();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mkInfo, setMkInfo] = useState<any>(null);
    const [semester, setSemester] = useState<string>("1"); // Default semester
    const [tahunAjaran, setTahunAjaran] = useState<string>("2024/2025"); // Default TA

    const [kendala, setKendala] = useState("");
    const [rencanaPerbaikan, setRencanaPerbaikan] = useState("");
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (mataKuliahId) {
            loadData();
        }
    }, [mataKuliahId, semester, tahunAjaran]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch MK Info
            const mkRes = await api.get(`/mata-kuliah/${mataKuliahId}`);
            if (mkRes.data) {
                setMkInfo(mkRes.data);
            }

            // Fetch Evaluasi
            const evalRes = await fetchEvaluasiMataKuliah(mataKuliahId!, semester, tahunAjaran);
            if (evalRes.data && evalRes.data.length > 0) {
                // Load latest evaluation for this semester/TA
                const latest = evalRes.data[0];
                setKendala(latest.kendala || "");
                setRencanaPerbaikan(latest.rencanaPerbaikan || "");
                setHistory(evalRes.data);
            } else {
                setKendala("");
                setRencanaPerbaikan("");
                setHistory([]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Gagal memuat data evaluasi");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await submitEvaluasiMataKuliah({
                mataKuliahId,
                semester,
                tahunAjaran,
                kendala,
                rencanaPerbaikan
            });
            toast.success("Evaluasi berhasil disimpan");
            loadData(); // Reload to update history
        } catch (error: any) {
            toast.error(error.message || "Gagal menyimpan evaluasi");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !mkInfo) return <div className="p-8">Loading...</div>;

    return (
        <DashboardPage
            title={`Evaluasi Mata Kuliah (CQI)`}
            description={`${mkInfo?.kodeMk} - ${mkInfo?.namaMk}`}
            actions={
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
            }
        >
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Evaluasi & Perbaikan</CardTitle>
                            <CardDescription>
                                Isi evaluasi pelaksanaan perkuliahan dan rencana perbaikan untuk semester depan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Semester</Label>
                                    <Select value={semester} onValueChange={setSemester}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tahun Ajaran</Label>
                                    <Select value={tahunAjaran} onValueChange={setTahunAjaran}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2023/2024">2023/2024</SelectItem>
                                            <SelectItem value="2024/2025">2024/2025</SelectItem>
                                            <SelectItem value="2025/2026">2025/2026</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Kendala / Masalah yang Dihadapi</Label>
                                <Textarea
                                    placeholder="Jelaskan kendala selama proses pembelajaran..."
                                    className="min-h-[100px]"
                                    value={kendala}
                                    onChange={(e) => setKendala(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Rencana Perbaikan (CQI)</Label>
                                <Textarea
                                    placeholder="Jelaskan rencana perbaikan konkret untuk periode berikutnya..."
                                    className="min-h-[150px]"
                                    value={rencanaPerbaikan}
                                    onChange={(e) => setRencanaPerbaikan(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    *Rencana ini akan menjadi acuan untuk perbaikan kualitas pembelajaran (PDCA Cycle).
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSave} disabled={saving}>
                                    <Save className="mr-2 h-4 w-4" /> Simpan Evaluasi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Evaluasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Belum ada riwayat evaluasi.</p>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((item, idx) => (
                                        <div key={idx} className="border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">{item.tahunAjaran} - Sem {item.semester}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(item.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {item.rencanaPerbaikan}
                                            </p>
                                            {item.feedbackKaprodi && (
                                                <div className="mt-2 bg-blue-50 p-2 rounded text-xs text-blue-800">
                                                    <strong>Feedback Kaprodi:</strong> {item.feedbackKaprodi}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardPage>
    );
};

export default EvaluasiMataKuliah;
