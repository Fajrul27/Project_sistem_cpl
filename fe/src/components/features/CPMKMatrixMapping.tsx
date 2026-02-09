import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { Info, Save, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
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
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";

interface MatrixProps {
    mataKuliahId: string;
    prodiId?: string;
    readOnly?: boolean;
    onBack?: () => void;
    highlightCpmkId?: string | null;
}

interface CellData {
    isMapped: boolean;
    bobot: number;
    mappingId: string | null;
    isDirty: boolean;
}

export function CPMKMatrixMapping({ mataKuliahId, prodiId, readOnly = false, onBack, highlightCpmkId }: MatrixProps) {
    const [cpmks, setCpmks] = useState<any[]>([]);
    const [cpls, setCpls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [matrix, setMatrix] = useState<Record<string, Record<string, CellData>>>({});
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    useEffect(() => {
        if (mataKuliahId) fetchData();
    }, [mataKuliahId, prodiId]);

    // Scroll to highlighted CPMK when loaded
    useEffect(() => {
        if (!loading && highlightCpmkId) {
            const element = document.getElementById(`cpmk-row-${highlightCpmkId}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }, [loading, highlightCpmkId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('[CPMKMatrixMapping] Fetching data with:', { mataKuliahId, prodiId });

            // Step 1: Fetch Mata Kuliah details if prodiId is not provided
            let effectiveProdiId = prodiId;

            if (!effectiveProdiId && mataKuliahId) {
                console.log('[CPMKMatrixMapping] ProdiId not provided, fetching mata kuliah details...');
                try {
                    const mkRes = await api.get(`/mata-kuliah/${mataKuliahId}`);
                    const mkData = mkRes.data;
                    effectiveProdiId = mkData.prodiId;
                    console.log('[CPMKMatrixMapping] Fetched prodiId from mata kuliah:', effectiveProdiId);

                    if (!effectiveProdiId) {
                        toast.error("Mata kuliah tidak memiliki Program Studi yang valid");
                        setLoading(false);
                        return;
                    }
                } catch (mkError) {
                    console.error('[CPMKMatrixMapping] Error fetching mata kuliah details:', mkError);
                    toast.error("Gagal memuat informasi mata kuliah");
                    setLoading(false);
                    return;
                }
            }

            // Step 2: Fetch CPMKs filtered by mataKuliahId
            console.log('[CPMKMatrixMapping] Fetching CPMKs with mataKuliahId:', mataKuliahId);
            const cpmkRes = await api.get('/cpmk', { params: { mataKuliahId, limit: 100 } });
            const cpmkData = cpmkRes.data.data || cpmkRes.data || [];
            console.log('[CPMKMatrixMapping] Fetched CPMKs:', cpmkData.length, 'items');

            // Sort CPMK by code (CPMK-1, CPMK-2...)
            cpmkData.sort((a: any, b: any) => a.kodeCpmk.localeCompare(b.kodeCpmk, undefined, { numeric: true }));
            setCpmks(cpmkData);

            // Step 3: Fetch CPLs filtered by prodiId
            if (!effectiveProdiId) {
                console.warn('[CPMKMatrixMapping] No prodiId available, cannot fetch CPLs');
                toast.error("Program Studi tidak ditemukan untuk mata kuliah ini");
                setLoading(false);
                return;
            }

            console.log('[CPMKMatrixMapping] Fetching CPLs with prodiId:', effectiveProdiId);
            const cplParams: any = { prodiId: effectiveProdiId, limit: 100 };
            const cplRes = await api.get('/cpl', { params: cplParams });
            let cplData = cplRes.data.data || cplRes.data || [];
            console.log('[CPMKMatrixMapping] Fetched CPLs:', cplData.length, 'items');

            // Find missing CPLs that are mapped but not in the fetched list (e.g. from different prodi)
            const mappedCplIds = new Set<string>();
            cpmkData.forEach((cpmk: any) => {
                if (cpmk.cplMappings) {
                    cpmk.cplMappings.forEach((mapping: any) => {
                        if (mapping.cplId) mappedCplIds.add(mapping.cplId);
                    });
                }
            });

            const fetchedCplIds = new Set(cplData.map((c: any) => c.id));
            const missingCplIds = Array.from(mappedCplIds).filter(id => !fetchedCplIds.has(id));

            if (missingCplIds.length > 0) {
                console.log('[CPMKMatrixMapping] Found mapped CPLs not in prodi list:', missingCplIds);
                try {
                    const missingCplPromises = missingCplIds.map(id => api.get(`/cpl/${id}`).catch(() => null));
                    const missingCplResponses = await Promise.all(missingCplPromises);

                    const validMissingCpls = missingCplResponses
                        .filter(res => res && res.data)
                        .map(res => res!.data);

                    if (validMissingCpls.length > 0) {
                        console.log('[CPMKMatrixMapping] Added missing CPLs:', validMissingCpls.length);
                        cplData = [...cplData, ...validMissingCpls];

                        // Deduplicate just in case
                        const uniqueCpls = new Map();
                        cplData.forEach((c: any) => uniqueCpls.set(c.id, c));
                        cplData = Array.from(uniqueCpls.values());
                    }
                } catch (err) {
                    console.error('[CPMKMatrixMapping] Error fetching missing CPLs:', err);
                }
            }

            // Sort CPL by code 
            cplData.sort((a: any, b: any) => a.kodeCpl.localeCompare(b.kodeCpl, undefined, { numeric: true }));
            setCpls(cplData);

            // Step 4: Build Matrix
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
                        // Ensure the CPL exists in our matrix columns (it should now)
                        if (initialMatrix[cpmk.id][mapping.cplId]) {
                            initialMatrix[cpmk.id][mapping.cplId] = {
                                isMapped: true,
                                bobot: Number(mapping.bobotPersentase),
                                mappingId: mapping.id,
                                isDirty: false
                            };
                        } else {
                            console.warn(`[CPMKMatrixMapping] Mapping found for CPL ${mapping.cplId} which is still missing from columns`);
                        }
                    });
                }
            });
            setMatrix(initialMatrix);

            console.log('[CPMKMatrixMapping] Matrix built successfully');

        } catch (error) {
            console.error("[CPMKMatrixMapping] Error loading matrix:", error);
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
        <div className="flex gap-6 relative animate-in fade-in duration-500">


            {/* Main Content */}
            <div className="flex-1 space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {!readOnly && (
                        <div className="flex-1">
                            <CollapsibleGuide title="Panduan Pengisian Matriks">
                                <div className="space-y-3">
                                    <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                        <li>Klik kotak pertemuan untuk menghubungkan CPMK dengan CPL (Toggle).</li>
                                        <li>Masukkan bobot kontribusi (0-100%) pada kotak input yang muncul.</li>
                                        <li>Pastikan total bobot per baris (CPMK) berjumlah <span className="font-bold">100%</span>.</li>
                                        <li>Total baris akan berwarna <span className="text-green-600 dark:text-green-400 font-bold">Hijau</span> jika pas 100%, dan <span className="text-amber-600 dark:text-amber-400 font-bold">Kuning</span> jika belum.</li>
                                    </ul>
                                </div>
                            </CollapsibleGuide>
                        </div>
                    )}

                    {!readOnly && (
                        <Button
                            onClick={saveChanges}
                            disabled={saving}
                            size="sm"
                            className="shadow-sm h-10 shrink-0"
                        >
                            {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Simpan Semua Perubahan
                        </Button>
                    )}
                </div>

                <div className="border rounded-lg shadow-sm bg-background overflow-hidden relative">
                    <div className="overflow-auto max-h-[70vh] relative">
                        <table className="relative min-w-max w-full border-collapse caption-bottom text-sm">
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

                                    const isHighlighted = highlightCpmkId === cpmk.id;
                                    return (
                                        <TableRow
                                            key={cpmk.id}
                                            id={`cpmk-row-${cpmk.id}`}
                                            className={cn(
                                                "group transition-all duration-300 border-b hover:bg-transparent",
                                                hoveredRow === cpmk.id ? "bg-muted/50" : "",
                                                isHighlighted ? "bg-blue-100 dark:bg-blue-900/30 border-l-[6px] border-l-blue-600 dark:border-l-blue-400" : ""
                                            )}
                                            onMouseEnter={() => setHoveredRow(cpmk.id)}
                                            onMouseLeave={() => setHoveredRow(null)}
                                        >
                                            {/* Row Header (CPMK Info) */}
                                            <TableCell className={cn(
                                                "sticky left-0 z-10 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] p-4 align-top transition-all duration-300",
                                                hoveredRow === cpmk.id ? "bg-muted" : "",
                                                isHighlighted ? "bg-blue-100 dark:bg-blue-950" : ""
                                            )}>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant={isHighlighted ? "default" : "secondary"} className={cn(
                                                            "font-bold text-sm",
                                                            isHighlighted ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-secondary/80"
                                                        )}>
                                                            {cpmk.kodeCpmk}
                                                        </Badge>
                                                        {isValid && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                        {isHighlighted && (
                                                            <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:text-blue-400">
                                                                Dipilih
                                                            </Badge>
                                                        )}
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
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
