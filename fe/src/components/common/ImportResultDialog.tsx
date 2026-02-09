
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface ImportResult {
    successCount: number;
    errors?: string[];
    message?: string;
}

interface ImportResultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    result: ImportResult | null;
    title: string;
    description?: string;
}

export const ImportResultDialog = ({ open, onOpenChange, result, title, description }: ImportResultDialogProps) => {
    if (!result) return null;

    const hasErrors = result.errors && result.errors.length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {hasErrors ? (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-secondary" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description || "Proses import data telah selesai dengan rincian berikut."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/10 p-3 rounded-lg border border-secondary/20 text-center">
                            <p className="text-2xl font-bold text-secondary">{result.successCount}</p>
                            <p className="text-xs text-secondary/80 font-medium">Berhasil</p>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${hasErrors ? 'bg-destructive/10 border-destructive/20' : 'bg-muted border-muted-foreground/10'}`}>
                            <p className={`text-2xl font-bold ${hasErrors ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {result.errors?.length || 0}
                            </p>
                            <p className={`text-xs font-medium ${hasErrors ? 'text-destructive/80' : 'text-muted-foreground/80'}`}>Gagal</p>
                        </div>
                    </div>

                    {hasErrors && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold flex items-center gap-1.5">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                Daftar Kesalahan:
                            </p>
                            <ScrollArea className="h-[200px] w-full rounded-md border border-destructive/10 bg-destructive/5 p-2">
                                <div className="space-y-1.5">
                                    {result.errors?.map((err, idx) => (
                                        <div key={idx} className="text-xs text-destructive flex gap-2 leading-relaxed">
                                            <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 opacity-50" />
                                            <span>{err}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
