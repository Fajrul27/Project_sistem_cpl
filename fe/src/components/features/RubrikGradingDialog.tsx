import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchRubrik } from "@/lib/api";
import { Calculator, Check, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RubrikGradingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cpmkId: string;
    mahasiswaName: string;
    teknikName: string;
    onSave: (nilai: number, rubrikData: any[]) => void;
}

export const RubrikGradingDialog = ({
    open,
    onOpenChange,
    cpmkId,
    mahasiswaName,
    teknikName,
    onSave
}: RubrikGradingDialogProps) => {
    const [loading, setLoading] = useState(true);
    const [rubrik, setRubrik] = useState<any>(null);
    const [selections, setSelections] = useState<Record<string, any>>({}); // kriteriaId -> level object

    useEffect(() => {
        if (open && cpmkId) {
            loadRubrik();
            setSelections({});
        }
    }, [open, cpmkId]);

    const loadRubrik = async () => {
        try {
            setLoading(true);
            const res = await fetchRubrik(cpmkId);
            if (res.data) {
                setRubrik(res.data);
            } else {
                setRubrik(null);
            }
        } catch (error: any) {
            console.error(error);
            // If 404, it just means no rubric exists yet
            if (error.message && error.message.includes('404')) {
                setRubrik(null);
            } else {
                toast.error("Gagal memuat rubrik");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLevel = (kriteriaId: string, level: any) => {
        setSelections(prev => ({
            ...prev,
            [kriteriaId]: level
        }));
    };

    const calculateScore = () => {
        if (!rubrik || !rubrik.kriteria) return 0;

        let totalScore = 0;
        let totalBobot = 0;

        rubrik.kriteria.forEach((k: any) => {
            const selectedLevel = selections[k.id];
            if (selectedLevel) {
                // Formula: (Nilai Level * Bobot Kriteria) / 100
                // Assuming Bobot Kriteria is in percentage (e.g., 50 for 50%)
                totalScore += (selectedLevel.nilai * k.bobot) / 100;
            }
            totalBobot += Number(k.bobot);
        });

        return parseFloat(totalScore.toFixed(2));
    };

    const handleSave = () => {
        // Validate all criteria selected
        if (rubrik && rubrik.kriteria) {
            const missing = rubrik.kriteria.find((k: any) => !selections[k.id]);
            if (missing) {
                toast.error(`Mohon pilih level untuk kriteria: ${missing.deskripsi}`);
                return;
            }
        }

        const finalScore = calculateScore();
        const rubrikData = Object.values(selections).map((l: any) => ({
            rubrikLevelId: l.id
        }));

        onSave(finalScore, rubrikData);
        onOpenChange(false);
    };

    const currentScore = calculateScore();

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Penilaian Rubrik</DialogTitle>
                    <DialogDescription>
                        Mahasiswa: <span className="font-semibold text-foreground">{mahasiswaName}</span> •
                        Teknik: <span className="font-semibold text-foreground">{teknikName}</span>
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center">Memuat rubrik...</div>
                ) : !rubrik ? (
                    <div className="py-10 text-center text-muted-foreground">
                        Belum ada rubrik untuk CPMK ini. Silakan buat rubrik terlebih dahulu.
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg mb-2">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" />
                                <span className="font-medium">Total Nilai:</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">
                                {currentScore}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 pb-4">
                                {rubrik.deskripsi && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertDescription>{rubrik.deskripsi}</AlertDescription>
                                    </Alert>
                                )}

                                {rubrik.kriteria?.map((k: any, index: number) => (
                                    <Card key={k.id} className="border-l-4 border-l-primary/50">
                                        <CardHeader className="py-3 bg-muted/20">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-base font-semibold">
                                                        {index + 1}. {k.deskripsi}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-1">Bobot: {k.bobot}%</p>
                                                </div>
                                                {selections[k.id] && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Terpilih
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {k.levels?.map((level: any) => {
                                                    const isSelected = selections[k.id]?.id === level.id;
                                                    return (
                                                        <div
                                                            key={level.id}
                                                            className={`
                                                                cursor-pointer rounded-lg border p-3 transition-all hover:border-primary
                                                                ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'}
                                                            `}
                                                            onClick={() => handleSelectLevel(k.id, level)}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-semibold text-sm">{level.label}</span>
                                                                <Badge variant={isSelected ? "default" : "outline"}>
                                                                    {level.nilai}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                {level.deskripsi}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>

                        <DialogFooter className="pt-4 border-t mt-auto">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                            <Button onClick={handleSave}>Simpan Nilai</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
