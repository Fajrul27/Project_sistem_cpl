import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, FileWarning, Search, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CompletenessCardProps {
    data: {
        cplEmpty: number;
        mkUnmapped: number;
        dosenNoInput: number;
        progressPengisian: number;
        cplEmptyList?: Array<{ id: string, kodeCpl: string, deskripsi: string }>;
        mkUnmappedList?: Array<{ id: string, kodeMk: string, namaMk: string }>;
    };
}

export const CompletenessCard = ({ data }: CompletenessCardProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'cpl' | 'mk' | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleOpenDialog = (type: 'cpl' | 'mk') => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const cplList = data.cplEmptyList || [];
    const mkList = data.mkUnmappedList || [];

    return (
        <>
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Status Kelengkapan Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-medium">Progress Pengisian Nilai</span>
                            <span className="font-bold text-primary">{data.progressPengisian}%</span>
                        </div>
                        <Progress value={data.progressPengisian} className="h-2.5 bg-muted/50" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => handleOpenDialog('cpl')}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 transition-all hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer active:scale-95 group"
                        >
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{data.cplEmpty}</p>
                            <p className="text-xs font-medium text-red-600/80 dark:text-red-400/80 text-center">CPL Kosong</p>
                            <span className="text-[10px] text-red-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail</span>
                        </div>
                        <div
                            onClick={() => handleOpenDialog('mk')}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 transition-all hover:bg-amber-100 dark:hover:bg-amber-900/20 cursor-pointer active:scale-95 group"
                        >
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                                <FileWarning className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.mkUnmapped}</p>
                            <p className="text-xs font-medium text-amber-600/80 dark:text-amber-400/80 text-center">MK Unmapped</p>
                            <span className="text-[10px] text-amber-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            {dialogType === 'cpl' ? (
                                <>
                                    <div className="bg-red-100 p-1.5 rounded-full"><AlertCircle className="h-5 w-5 text-red-600" /></div>
                                    CPL Tanpa Nilai ({data.cplEmpty})
                                </>
                            ) : (
                                <>
                                    <div className="bg-amber-100 p-1.5 rounded-full"><FileWarning className="h-5 w-5 text-amber-600" /></div>
                                    Mata Kuliah Unmapped ({data.mkUnmapped})
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogType === 'cpl'
                                ? "Daftar Capaian Pembelajaran Lulusan yang belum memiliki data nilai."
                                : "Daftar Mata Kuliah yang belum memiliki pemetaan CPMK."}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6 pt-0">
                        <div className="space-y-3">
                            {dialogType === 'cpl' ? (
                                cplList.length > 0 ? (
                                    cplList.map((item) => (
                                        <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge variant="outline" className="font-bold border-red-200 text-red-700 bg-red-50">{item.kodeCpl}</Badge>
                                            </div>
                                            <p className="text-sm mt-1.5 text-muted-foreground line-clamp-2">{item.deskripsi}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Tidak ada data ditemukan
                                    </div>
                                )
                            ) : (
                                mkList.length > 0 ? (
                                    mkList.map((item) => (
                                        <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge variant="outline" className="font-bold border-amber-200 text-amber-700 bg-amber-50">{item.kodeMk}</Badge>
                                            </div>
                                            <p className="text-sm font-medium mt-1">{item.namaMk}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Tidak ada data ditemukan
                                    </div>
                                )
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};
