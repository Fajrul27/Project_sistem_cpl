import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { Info, Save, AlertCircle, CheckCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MatrixProps {
    mataKuliahId: string;
    prodiId?: string;
    readOnly?: boolean;
}

interface CellData {
    isMapped: boolean;
    bobot: number;
    mappingId: string | null;
    isDirty: boolean;
}

export function CPMKMatrixMapping({ mataKuliahId, prodiId, readOnly = false }: MatrixProps) {
    const [cpmks, setCpmks] = useState<any[]>([]);
    const [cpls, setCpls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [matrix, setMatrix] = useState<Record<string, Record<string, CellData>>>({});
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    useEffect(() => {
        if (mataKuliahId) fetchData();
    }, [mataKuliahId, prodiId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch CPMKs
            const cpmkRes = await api.get('/cpmk', { params: { mataKuliahId, limit: 100 } });
            const cpmkData = cpmkRes.data.data || cpmkRes.data || [];

            // Sort CPMK by code (CPMK-1, CPMK-2...)
            cpmkData.sort((a: any, b: any) => a.kodeCpmk.localeCompare(b.kodeCpmk, undefined, { numeric: true }));
            setCpmks(cpmkData);

            // Fetch CPLs
            const cplParams: any = { limit: 100 };
            if (prodiId) cplParams.prodiId = prodiId;
            const cplRes = await api.get('/cpl', { params: cplParams });
            const cplData = cplRes.data.data || cplRes.data || [];
            // Sort CPL by code 
            cplData.sort((a: any, b: any) => a.kodeCpl.localeCompare(b.kodeCpl, undefined, { numeric: true }));
            setCpls(cplData);

            // Build Matrix
            const initialMatrix: Record<string, Record<string, CellData>> = {};
            cpmkData.forEach((cpmk: any) => {
                initialMatrix[cpmk.id] = {};
                cplData.forEach((cpl: any) => {
                    initialMatrix[cpmk.id][cpl.id] = {
                        isMapped: false,
                        bobot: 0,
                        mappingId: null,
                        isDirty: false
                    };
                });
                if (cpmk.cplMappings) {
                    cpmk.cplMappings.forEach((mapping: any) => {
                        if (initialMatrix[cpmk.id][mapping.cplId]) {
                            initialMatrix[cpmk.id][mapping.cplId] = {
                                isMapped: true,
                                bobot: Number(mapping.bobotPersentase),
                                mappingId: mapping.id,
                                isDirty: false
                            };
                        }
                    });
                }
            });
            setMatrix(initialMatrix);

        } catch (error) {
            console.error("Error loading matrix:", error);
            toast.error("Gagal memuat data matrix");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (cpmkId: string, cplId: string) => {
        if (readOnly) return;

        setMatrix(prev => {
            const cell = prev[cpmkId][cplId];
            return {
                ...prev,
                [cpmkId]: {
                    ...prev[cpmkId],
                    [cplId]: {
                        ...cell,
                        isMapped: !cell.isMapped,
                        bobot: !cell.isMapped ? 0 : 0, // Reset to 0 if unchecked, or 0 if checked (user inputs manually)
                        isDirty: true
                    }
                }
            };
        });
    };

    const handleBobotChange = (cpmkId: string, cplId: string, val: string) => {
        if (readOnly) return;

        let numVal = Number(val);
        if (numVal < 0) numVal = 0;
        if (numVal > 100) numVal = 100;

        setMatrix(prev => ({
            ...prev,
            [cpmkId]: {
                ...prev[cpmkId],
                [cplId]: {
                    ...prev[cpmkId][cplId],
                    bobot: numVal,
                    isDirty: true
                }
            }
        }));
    };

    const saveChanges = async () => {
        if (readOnly) return;
        setSaving(true);
        try {
            const promises: Promise<any>[] = [];
            for (const cpmkId of Object.keys(matrix)) {
                for (const cplId of Object.keys(matrix[cpmkId])) {
                    const cell = matrix[cpmkId][cplId];
                    if (cell.isDirty) {
                        if (cell.isMapped) {
                            if (cell.mappingId) {
                                promises.push(api.put(`/cpmk-mapping/${cell.mappingId}`, { bobotPersentase: cell.bobot }));
                            } else {
                                promises.push(api.post('/cpmk-mapping', { cpmkId, cplId, bobotPersentase: cell.bobot }));
                            }
                        } else {
                            if (cell.mappingId) {
                                promises.push(api.delete(`/cpmk-mapping/${cell.mappingId}`));
                            }
                        }
                    }
                }
            }
            await Promise.all(promises);
            toast.success("Perubahan berhasil disimpan");
            fetchData();
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    // Calculate row totals
    const rowTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        Object.keys(matrix).forEach(cpmkId => {
            totals[cpmkId] = Object.values(matrix[cpmkId])
                .filter(cell => cell.isMapped)
                .reduce((sum, cell) => sum + cell.bobot, 0);
        });
        return totals;
    }, [matrix]);

    if (loading) return <LoadingSpinner />;
    if (cpmks.length === 0) return <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">Tidak ada CPMK untuk mata kuliah ini.</div>;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Legend & Help */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 gap-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p className="font-semibold">Panduan Pengisian Matrix:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-blue-700/80 dark:text-blue-300/80">
                            <li>Klik kotak pertemuan untuk menghubungkan CPMK dengan CPL (Toggle).</li>
                            <li>Masukkan bobot kontribusi (0-100%) pada kotak input yang muncul.</li>
                            <li>Pastikan total bobot per baris (CPMK) berjumlah <span className="font-bold">100%</span>.</li>
                            <li>Total baris akan berwarna <span className="text-green-600 dark:text-green-400 font-bold">Hijau</span> jika pas 100%, dan <span className="text-amber-600 dark:text-amber-400 font-bold">Kuning</span> jika belum.</li>
                        </ul>
                    </div>
                </div>
                {!readOnly && (
                    <Button onClick={saveChanges} disabled={saving} className="shadow-sm">
                        {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan Semua Perubahan
                    </Button>
                )}
            </div>

            <div className="border rounded-lg shadow-sm bg-background overflow-hidden relative">
                <div className="overflow-x-auto max-h-[70vh]">
                    <Table className="relative w-full border-collapse">
                        <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur shadow-sm select-none">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-[300px] min-w-[250px] sticky left-0 z-30 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-4">
                                    <div className="flex flex-col gap-1 px-2">
                                        <span className="font-bold text-lg text-foreground">CPMK</span>
                                        <span className="text-xs font-normal text-muted-foreground">Baris ini adalah CPMK</span>
                                    </div>
                                </TableHead>
                                {cpls.map(cpl => (
                                    <TableHead key={cpl.id} className="text-center min-w-[100px] py-4 border-r border-dashed border-border/50 last:border-r-0 align-bottom">
                                        <TooltipProvider>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div className="flex flex-col items-center gap-2 cursor-help group">
                                                        <span className="font-bold text-primary group-hover:underline decoration-dotted underline-offset-4">
                                                            {cpl.kodeCpl}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] font-normal px-1 h-5 hidden sm:flex border-border">
                                                            CPL
                                                        </Badge>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-sm text-xs p-3">
                                                    <p className="font-semibold mb-1">{cpl.kodeCpl}</p>
                                                    {cpl.deskripsi}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableHead>
                                ))}
                                <TableHead className="w-[100px] bg-background text-center font-bold border-l sticky right-0 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Total
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cpmks.map(cpmk => {
                                const total = rowTotals[cpmk.id] || 0;
                                const isValid = Math.abs(total - 100) < 0.1; // Float tolerance
                                const isZero = total === 0;

                                return (
                                    <TableRow
                                        key={cpmk.id}
                                        className={cn(
                                            "group transition-colors border-b hover:bg-transparent",
                                            hoveredRow === cpmk.id ? "bg-muted/50" : ""
                                        )}
                                        onMouseEnter={() => setHoveredRow(cpmk.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        {/* Row Header (CPMK Info) */}
                                        <TableCell className={cn(
                                            "sticky left-0 z-10 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] p-4 align-top transition-colors",
                                            hoveredRow === cpmk.id ? "bg-muted/50" : ""
                                        )}>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary" className="font-bold hover:bg-secondary/80">
                                                        {cpmk.kodeCpmk}
                                                    </Badge>
                                                    {isValid && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {cpmk.deskripsi}
                                                </p>
                                            </div>
                                        </TableCell>

                                        {/* Matrix Cells */}
                                        {cpls.map(cpl => {
                                            const cell = matrix[cpmk.id]?.[cpl.id] || { isMapped: false, bobot: 0 };
                                            return (
                                                <TableCell
                                                    key={cpl.id}
                                                    className={cn(
                                                        "p-0 border-r border-dashed border-border/50 last:border-r-0 relative align-middle",
                                                        !cell.isMapped ? (readOnly ? "cursor-default" : "hover:bg-muted/30 cursor-pointer") : "bg-primary/5 dark:bg-primary/10"
                                                    )}
                                                    onClick={() => !readOnly && !cell.isMapped && handleToggle(cpmk.id, cpl.id)}
                                                >
                                                    <div className="flex flex-col items-center justify-center w-full h-[70px] relative group/cell">
                                                        {!cell.isMapped ? (
                                                            <div className={`absolute inset-0 flex items-center justify-center text-muted-foreground/40 ${!readOnly && "group-hover/cell:text-primary"} transition-colors`}>
                                                                <span className="text-2xl font-light select-none bg-muted/20 rounded-full w-8 h-8 flex items-center justify-center">+</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="absolute inset-0 flex items-center justify-center p-2">
                                                                    <div className="relative w-20">
                                                                        <Input
                                                                            type="number"
                                                                            className="h-10 text-center text-base font-semibold bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                            value={cell.bobot}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={(e) => handleBobotChange(cpmk.id, cpl.id, e.target.value)}
                                                                            onFocus={(e) => e.target.select()}
                                                                            placeholder="0"
                                                                            disabled={readOnly}
                                                                        />
                                                                        <span className="absolute right-2 top-2.5 text-xs text-muted-foreground pointer-events-none font-medium">%</span>
                                                                    </div>
                                                                </div>

                                                                {/* Unmap Button (X) - visible on hover */}
                                                                {!readOnly && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleToggle(cpmk.id, cpl.id);
                                                                        }}
                                                                        className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:bg-destructive/90 transition-all z-10"
                                                                        title="Hapus Mapping"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}

                                        {/* Row Total Validation */}
                                        <TableCell className="sticky right-0 z-10 bg-background/95 backdrop-blur-sm border-l shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] p-4 text-center align-middle">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={cn(
                                                    "text-sm font-bold",
                                                    isValid ? "text-green-600 dark:text-green-400" : isZero ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400"
                                                )}>
                                                    {total.toFixed(0)}%
                                                </div>
                                                <Progress
                                                    value={total}
                                                    className={cn("h-2 w-16",
                                                        isValid ? "bg-green-100 dark:bg-green-950" : "bg-muted"
                                                    )}
                                                />
                                                {!isValid && !isZero && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Total harus 100%
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
