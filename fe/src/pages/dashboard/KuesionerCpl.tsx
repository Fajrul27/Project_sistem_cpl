import { DashboardPage } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePermission } from "@/contexts/PermissionContext";
import { useKuesioner } from "@/hooks/useKuesioner";

export default function KuesionerCplPage() {
    const { can } = usePermission();
    const {
        role,
        cplList,
        responses,
        loading,
        submitting,
        hasSubmitted,
        currentSemester,
        currentTahunAjaranId,
        handleSliderChange,
        handleSubmit
    } = useKuesioner();

    if (!can('view', 'kuesioner')) {
        return (
            <DashboardPage title="Kuesioner CPL" description="Evaluasi Diri Mahasiswa">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p>Halaman ini khusus untuk mahasiswa yang memiliki akses kuesioner.</p>
                    </CardContent>
                </Card>
            </DashboardPage>
        );
    }

    return (
        <DashboardPage title="Kuesioner CPL (Self-Assessment)" description="Evaluasi kemampuan diri Anda terhadap Capaian Pembelajaran Lulusan (CPL)">
            <div className="space-y-6">
                <CollapsibleGuide title="Panduan Kuesioner Self-Assessment">
                    <div className="space-y-3">
                        <p>Kuesioner ini bertujuan untuk mengukur tingkat kepercayaan diri Anda (self-efficacy) terhadap pencapaian kompetensi lulusan.</p>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                            <li><strong>Skala 0-100:</strong> 0 berarti sangat kurang, 50 berarti cukup, dan 100 berarti sangat baik/mahir.</li>
                            <li><strong>Kerahasiaan:</strong> Penilaian ini digunakan oleh program studi untuk peningkatan kualitas kurikulum secara kolektif.</li>
                            <li><strong>Kejujuran:</strong> Berikan nilai yang paling mendekati kemampuan Anda saat ini agar evaluasi program studi akurat.</li>
                        </ul>
                    </div>
                </CollapsibleGuide>

                <Card>
                    <CardHeader>
                        <CardTitle>Penilaian Diri Semester {currentSemester} ({currentTahunAjaranId})</CardTitle>
                        <CardDescription>
                            Silakan nilai kemampuan diri Anda untuk setiap poin CPL berikut ini (Skala 0-100).
                            Jujurlah dalam menilai untuk bahan evaluasi prodi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Memuat...</div>
                        ) : role !== 'mahasiswa' ? (
                            <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                                <p className="text-lg font-medium text-muted-foreground">Mode Pratinjau Terbatas</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Sebagai {role}, Anda tidak dapat mengisi kuesioner ini.
                                    Halaman ini khusus untuk mahasiswa.
                                </p>
                            </div>
                        ) : cplList.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg border-dashed">
                                <p className="text-muted-foreground">Belum ada data CPL yang tersedia untuk Program Studi Anda.</p>
                            </div>
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
