import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { CPL } from "@/hooks/useCPL";
import { MataKuliah } from "@/hooks/useMataKuliah";
import { Save, Info, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleGuide } from "@/components/common/CollapsibleGuide";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CPLMKWeightMatrixProps {
    cplList: CPL[];
    mkList: MataKuliah[];
    initialMappings: Record<string, number>; // Key: `${cplId}-${mkId}` -> weight
    onSave: (updates: { cplId: string; mataKuliahId: string; bobotKontribusi: number }[]) => Promise<boolean>;
    loading?: boolean;
    readOnly?: boolean;
}

export const CPLMKWeightMatrix = ({
    cplList,
    mkList,
    initialMappings,
    onSave,
    loading = false,
    readOnly = false
}: CPLMKWeightMatrixProps) => {
    const [weights, setWeights] = useState<Record<string, number>>(initialMappings);
    const [saving, setSaving] = useState(false);
    const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());

    // Initialize weights from props (Convert to Percentage)
    useEffect(() => {
        const percentageMap: Record<string, number> = {};
        Object.entries(initialMappings).forEach(([k, v]) => {
            percentageMap[k] = Math.round(v * 100);
        });
        // Preserve any existing local edits if needed? No, initialMappings change resets form usually.
        setWeights(percentageMap);
        setChangedKeys(new Set());
    }, [initialMappings]);

    const handleWeightChange = (cplId: string, mkId: string, value: string) => {
        if (readOnly) return;

        // Allow empty string for "clearing" but treat as 0 for calculations
        // If value is empty, we set it to 0 or remove key? 
        // Better to set to 0 visually or keep as is? 
        // Let's store 0.

        let numValue = 0;
        if (value !== "") {
            numValue = parseInt(value);
        }

        if (isNaN(numValue)) return;

        // Limit range 0-100
        if (numValue < 0) numValue = 0;
        if (numValue > 100) numValue = 100;

        const key = `${cplId}_${mkId}`;
        setWeights(prev => ({
            ...prev,
            [key]: numValue
        }));

        setChangedKeys(prev => {
            const newSet = new Set(prev);
            newSet.add(key);
            return newSet;
        });
    };

    const calculateTotalWeight = (mkId: string) => {
        let total = 0;
        cplList.forEach(cpl => {
            const key = `${cpl.id}_${mkId}`;
            total += weights[key] || 0;
        });
        return total;
    };

    const handleBatchSave = async () => {
        if (readOnly) return;

        // Validate Totals
        const invalidMKs: string[] = [];
        const updates: { cplId: string; mataKuliahId: string; bobotKontribusi: number }[] = [];

        // We only need to check MKs that have at least one weight > 0
        const mksToCheck = mkList.filter(mk => calculateTotalWeight(mk.id) > 0);

        mksToCheck.forEach(mk => {
            const total = calculateTotalWeight(mk.id);
            // Allow slight precision error if we were doing float math, but we are doing int.
            // Strict 100 check.
            if (total !== 100) {
                invalidMKs.push(`${mk.kodeMk} (${total}%)`);
            }
        });

        if (invalidMKs.length > 0) {
            toast.error(`Total bobot harus 100% untuk: ${invalidMKs.slice(0, 3).join(", ")}${invalidMKs.length > 3 ? "..." : ""}`);
            return;
        }

        Array.from(changedKeys).forEach(key => {
            const [cplId, mkId] = key.split('_');
            updates.push({
                cplId,
                mataKuliahId: mkId,
                bobotKontribusi: (weights[key] || 0) / 100 // Convert back to decimal 0-1
            });
        });

        if (updates.length === 0) {
            toast.info("Tidak ada perubahan");
            return;
        }

        setSaving(true);
        try {
            // Note: We might want to pass ALL weights for the modified MKs if we want to be safe, 
            // but assuming backend upserts correctly, diff is fine.
            const success = await onSave(updates);
            if (success) {
                setChangedKeys(new Set());
                toast.success("Perubahan bobot berhasil disimpan");
            }
        } catch (error) {
            console.error("Error saving batch:", error);
            toast.error("Gagal menyimpan perubahan");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                    {!readOnly && (
                        <CollapsibleGuide title="Panduan Bobot MK">
                            <div className="space-y-3">
                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground">
                                    <li>Isi bobot kontribusi (0 - 100%) untuk hubungan Mata Kuliah dan CPL.</li>
                                    <li><span className="font-bold">Total bobot per Mata Kuliah (baris) WAJIB = 100%</span>.</li>
                                    <li>Biarkan kosong atau 0 untuk tidak ada hubungan.</li>
                                    {!readOnly && <li>Jangan lupa klik tombol <span className="font-bold">Simpan Semua Perubahan</span> setelah selesai.</li>}
                                </ul>
                            </div>
                        </CollapsibleGuide>
                    )}
                </div>

                {!readOnly && (
                    <Button
                        onClick={handleBatchSave}
                        disabled={saving || changedKeys.size === 0}
                        size="sm"
                        className="shadow-sm h-10 shrink-0"
                    >
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
                                        <span className="font-bold text-lg text-foreground">Mata Kuliah</span>
                                        <span className="text-xs font-normal text-muted-foreground">Semester & Nama MK</span>
                                    </div>
                                </TableHead>
                                {cplList.map(cpl => (
                                    <TableHead key={cpl.id} className="text-center min-w-[80px] py-4 border-r border-dashed border-border/50 last:border-r-0 align-bottom">
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
                                <TableHead className="w-[100px] text-center font-bold border-l sticky right-0 z-30 bg-background shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mkList.map(mk => {
                                const totalWeight = calculateTotalWeight(mk.id);
                                // Strict 100 check for percentage
                                const isValid = totalWeight === 0 || totalWeight === 100;

                                return (
                                    <TableRow key={mk.id} className="group transition-colors border-b hover:bg-transparent">
                                        <TableCell className="sticky left-0 z-10 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] p-4 align-top transition-colors group-hover:bg-muted/50">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="font-mono text-[10px]">
                                                        {mk.kodeMk}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        Sem {mk.semester}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium leading-tight text-foreground/90 line-clamp-2" title={mk.namaMk}>
                                                    {mk.namaMk}
                                                </p>
                                            </div>
                                        </TableCell>
                                        {cplList.map(cpl => {
                                            const key = `${cpl.id}_${mk.id}`;
                                            const val = weights[key];
                                            const displayVal = val !== undefined ? val.toString() : ""; // Show 0 as "0" if explicit? Or empty? Logic before was 'val !== 0'. Let's show 0 as 0 now that it's integer.
                                            // Actually, the previous logic `val !== undefined && val !== 0` hid 0s. 
                                            // For percentage, maybe showing "0" is clutter. Let's keep hiding 0s but allow input "0".
                                            const valStr = val !== undefined && val !== 0 ? val.toString() : "";

                                            const isChanged = changedKeys.has(key);

                                            return (
                                                <TableCell
                                                    key={key}
                                                    className={cn(
                                                        "p-2 border-r border-dashed border-border/50 last:border-r-0 text-center align-middle transition-colors",
                                                        !readOnly && "hover:bg-muted/30",
                                                        isChanged && "bg-blue-50/50 dark:bg-blue-900/10"
                                                    )}
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            max="100"
                                                            className={cn(
                                                                "h-8 w-16 text-center mx-auto transition-all px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                                                valStr !== "" ? "font-bold border-primary/50 bg-primary/5" : "text-muted-foreground border-dashed bg-transparent hover:bg-background hover:border-solid",
                                                                isChanged && "border-blue-400 ring-1 ring-blue-400/20"
                                                            )}
                                                            placeholder="+"
                                                            value={valStr}
                                                            onChange={(e) => handleWeightChange(cpl.id, mk.id, e.target.value)}
                                                            disabled={readOnly}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                                                    // Allow default increment for integers
                                                                }
                                                            }}
                                                        />
                                                        <span className={cn(
                                                            "absolute right-2 text-[10px] text-muted-foreground pointer-events-none transition-opacity",
                                                            valStr !== "" ? "opacity-100" : "opacity-0"
                                                        )}>%</span>
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className={cn(
                                            "sticky right-0 z-10 border-l shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] text-center font-bold text-xs p-0",
                                            isValid ? (totalWeight === 0 ? "text-muted-foreground bg-background" : "text-green-600 bg-green-50/30 dark:bg-green-900/10") : "text-destructive bg-destructive/5"
                                        )}>
                                            <div className="flex items-center justify-center gap-1 w-full h-full min-h-[60px]">
                                                {totalWeight > 0 && totalWeight + "%"}
                                                {!isValid && <AlertTriangle className="w-3 h-3" />}
                                                {totalWeight === 0 && "-"}
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
};
