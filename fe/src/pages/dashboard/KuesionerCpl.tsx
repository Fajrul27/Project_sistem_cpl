import { useState, useEffect } from "react";
import { DashboardPage } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Save, CheckCircle2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Cpl {
    id: string;
    kodeCpl: string;
    deskripsi: string;
}

interface KuesionerItem {
    cplId: string;
    nilai: number;
}

export default function KuesionerCplPage() {
    const { role, profile, loading: roleLoading } = useUserRole();
    const [cplList, setCplList] = useState<Cpl[]>([]);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Assuming current semester/year (should be fetched from system settings in real app)
    const currentSemester = profile?.semester || 1;
    const currentTahunAjaran = "2024/2025 Ganjil";

    useEffect(() => {
        if (!roleLoading && role === "mahasiswa") {
            fetchData();
        }
    }, [role, roleLoading, currentSemester]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch CPLs
            const cplRes = await api.get("/cpl");
            setCplList(cplRes.data || cplRes); // Handle both formats

            // Fetch existing responses
            const existingRes = await api.get("/kuesioner/me", {
                params: {
                    semester: currentSemester,
                    tahunAjaran: currentTahunAjaran
                }
            });

            const existingData = Array.isArray(existingRes) ? existingRes : existingRes.data;

            if (existingData && existingData.length > 0) {
                setHasSubmitted(true);
                const initialResponses: Record<string, number> = {};
                existingData.forEach((item: any) => {
                    initialResponses[item.cplId] = item.nilai;
                });
                setResponses(initialResponses);
            } else {
                // Initialize with default values (e.g., 50)
                const initialResponses: Record<string, number> = {};
                const cpls = Array.isArray(cplRes) ? cplRes : (cplRes.data || []);
                cpls.forEach((cpl: Cpl) => {
                    initialResponses[cpl.id] = 50;
                });
                setResponses(initialResponses);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Gagal memuat data kuesioner");
        } finally {
            setLoading(false);
        }
    };

    const handleSliderChange = (cplId: string, value: number[]) => {
        setResponses(prev => ({
            ...prev,
            [cplId]: value[0]
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                semester: currentSemester,
                tahunAjaran: currentTahunAjaran,
                nilai: Object.entries(responses).map(([cplId, nilai]) => ({
                    cplId,
                    nilai
                }))
            };

            await api.post("/kuesioner", payload);
            toast.success("Kuesioner berhasil disimpan");
            setHasSubmitted(true);
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Gagal menyimpan kuesioner");
        } finally {
            setSubmitting(false);
        }
    };

    if (role !== "mahasiswa") {
        return (
            <DashboardPage title="Kuesioner CPL" description="Evaluasi Diri Mahasiswa">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p>Halaman ini khusus untuk mahasiswa.</p>
                    </CardContent>
                </Card>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage title="Kuesioner CPL (Self-Assessment)" description="Evaluasi kemampuan diri Anda terhadap Capaian Pembelajaran Lulusan (CPL)">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Penilaian Diri Semester {currentSemester} ({currentTahunAjaran})</CardTitle>
                        <CardDescription>
                            Silakan nilai kemampuan diri Anda untuk setiap poin CPL berikut ini (Skala 0-100).
                            Jujurlah dalam menilai untuk bahan evaluasi prodi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Memuat...</div>
                        ) : (
                            <div className="space-y-8">
                                {cplList.map((cpl) => (
                                    <div key={cpl.id} className="space-y-4 border-b pb-6 last:border-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h4 className="font-semibold text-lg">{cpl.kodeCpl}</h4>
                                                <p className="text-muted-foreground">{cpl.deskripsi}</p>
                                            </div>
                                            <div className="text-right min-w-[80px]">
                                                <span className={`text-2xl font-bold ${responses[cpl.id] >= 80 ? "text-green-600" :
                                                    responses[cpl.id] >= 60 ? "text-blue-600" :
                                                        "text-orange-600"
                                                    }`}>
                                                    {responses[cpl.id]}
                                                </span>
                                                <span className="text-sm text-muted-foreground">/100</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 px-2">
                                            <Slider
                                                value={[responses[cpl.id] || 0]}
                                                max={100}
                                                step={1}
                                                onValueChange={(val) => handleSliderChange(cpl.id, val)}
                                                className="cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>Kurang (0)</span>
                                                <span>Cukup (50)</span>
                                                <span>Sangat Baik (100)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        size="lg"
                                        className="w-full md:w-auto"
                                    >
                                        {submitting ? "Menyimpan..." : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {hasSubmitted ? "Update Penilaian" : "Simpan Penilaian"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
}
