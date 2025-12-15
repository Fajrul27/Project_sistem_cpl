import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/common/LoadingScreen";
import { ProfilLulusan } from "@/hooks/useProfilLulusan";
import { CPL } from "@/hooks/useCPL";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface PLMappingMatrixProps {
  profilList: ProfilLulusan[];
  cplList: CPL[];
  onUpdate: (profilId: string, cplIds: string[]) => Promise<boolean>;
  loading?: boolean;
}



export const PLMappingMatrix = ({
  profilList,
  cplList,
  onUpdate,
  loading = false
}: PLMappingMatrixProps) => {
  const [mappings, setMappings] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState<Set<string>>(new Set());

  // Initialize mappings from props
  useEffect(() => {
    const newMappings: Record<string, Set<string>> = {};
    profilList.forEach(profil => {
      // Use cplId directly as it is the foreign key
      const cplIds = new Set(profil.cplMappings?.map(m => m.cplId) || []);
      newMappings[profil.id] = cplIds;
    });
    setMappings(newMappings);
    setHasChanges(new Set());
  }, [profilList]);

  const handleToggle = (profilId: string, cplId: string) => {
    setMappings(prev => {
      const currentSet = new Set(prev[profilId] || []);
      if (currentSet.has(cplId)) {
        currentSet.delete(cplId);
      } else {
        currentSet.add(cplId);
      }
      return { ...prev, [profilId]: currentSet };
    });

    setHasChanges(prev => {
      const newSet = new Set(prev);
      newSet.add(profilId);
      return newSet;
    });
  };

  const handleBatchSave = async () => {
    setSaving(true);
    try {
      const promises = Array.from(hasChanges).map(profilId => {
        const cplIds = Array.from(mappings[profilId] || []);
        return onUpdate(profilId, cplIds);
      });

      await Promise.all(promises);
      setHasChanges(new Set());
      toast.success("Perubahan berhasil disimpan");
    } catch (error) {
      console.error("Error saving batch:", error);
      toast.error("Gagal menyimpan beberapa perubahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (profilList.length === 0 || cplList.length === 0) {
    return <div className="text-center p-8 text-muted-foreground">Data Profil Lulusan atau CPL belum tersedia.</div>;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Legend & Help */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-semibold">Panduan Mapping:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-blue-700/80 dark:text-blue-300/80">
              <li>Klik kotak pertemuan untuk menghubungkan Profil Lulusan dengan CPL.</li>
              <li>Tanda <span className="font-bold">Check</span> menandakan terhubung.</li>
              <li>Jangan lupa klik tombol <span className="font-bold">Simpan Semua Perubahan</span> setelah selesai.</li>
            </ul>
          </div>
        </div>
        <Button onClick={handleBatchSave} disabled={saving || hasChanges.size === 0} className="shadow-sm">
          {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Semua Perubahan
        </Button>
      </div>

      <div className="border rounded-lg shadow-sm bg-background overflow-hidden relative">
        <div className="overflow-x-auto max-h-[70vh]">
          <Table className="relative w-full border-collapse">
            <TableHeader className="sticky top-0 z-20 bg-background/95 backdrop-blur shadow-sm select-none">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[300px] min-w-[250px] sticky left-0 z-30 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] py-4">
                  <div className="flex flex-col gap-1 px-2">
                    <span className="font-bold text-lg text-foreground">Profil Lulusan</span>
                    <span className="text-xs font-normal text-muted-foreground">Baris ini adalah Profil Lulusan</span>
                  </div>
                </TableHead>
                {cplList.map(cpl => (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {profilList.map(profil => (
                <TableRow key={profil.id} className="group transition-colors border-b hover:bg-transparent">
                  <TableCell className="sticky left-0 z-10 bg-background border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] p-4 align-top transition-colors group-hover:bg-muted/50">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="font-bold hover:bg-secondary/80">
                          {profil.kode}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {profil.nama}
                      </p>
                    </div>
                  </TableCell>
                  {cplList.map(cpl => {
                    const isChecked = mappings[profil.id]?.has(cpl.id);
                    return (
                      <TableCell
                        key={`${profil.id}-${cpl.id}`}
                        className={`p-0 border-r border-dashed border-border/50 last:border-r-0 relative align-middle cursor-pointer transition-colors ${isChecked ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/30'}`}
                        onClick={() => handleToggle(profil.id, cpl.id)}
                      >
                        <div className="flex flex-col items-center justify-center w-full h-[80px] relative group/cell">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(profil.id, cpl.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground scale-125 pointer-events-none"
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
