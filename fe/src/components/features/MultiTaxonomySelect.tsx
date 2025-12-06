import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api";

interface TaxonomyLevel {
    value: string;
    label: string;
    group: string;
}

interface MultiTaxonomySelectProps {
    value: string; // comma-separated string from API
    onChange: (value: string[]) => void; // array for form state
}

export function MultiTaxonomySelect({ value, onChange }: MultiTaxonomySelectProps) {
    const [open, setOpen] = useState(false);
    const [levels, setLevels] = useState<TaxonomyLevel[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/level-taksonomi');
            const data = response.data || [];

            const mappedLevels = data.map((item: any) => ({
                value: item.kode,
                label: `${item.kode} - ${item.deskripsi}`,
                group: item.kategori || "Lainnya"
            }));

            setLevels(mappedLevels);
        } catch (error) {
            console.error("Failed to fetch taxonomy levels", error);
        } finally {
            setLoading(false);
        }
    };

    // Convert comma-separated string to array
    const selectedValues = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];

    const toggleSelection = (levelValue: string) => {
        const newSelected = selectedValues.includes(levelValue)
            ? selectedValues.filter(v => v !== levelValue)
            : [...selectedValues, levelValue];
        onChange(newSelected);
    };

    const removeValue = (levelValue: string) => {
        onChange(selectedValues.filter(v => v !== levelValue));
    };

    // Group levels by category
    const groupedLevels = levels.reduce((acc, level) => {
        if (!acc[level.group]) acc[level.group] = [];
        acc[level.group].push(level);
        return acc;
    }, {} as Record<string, TaxonomyLevel[]>);

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-normal"
                    >
                        {selectedValues.length > 0
                            ? `${selectedValues.length} level dipilih`
                            : "Pilih level taksonomi..."}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command className="overflow-visible">
                        <CommandInput
                            placeholder="Cari level..."
                            className="focus:ring-0 focus:border-none focus:outline-none ring-0 border-none"
                        />
                        <CommandList className="max-h-[200px] overflow-y-auto pointer-events-auto">
                            {loading ? (
                                <div className="py-6 text-center text-sm text-muted-foreground flex justify-center items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Memuat...
                                </div>
                            ) : (
                                <>
                                    <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                    {Object.entries(groupedLevels).map(([group, groupLevels]) => (
                                        <CommandGroup key={group} heading={group}>
                                            {groupLevels.map((level) => (
                                                <CommandItem
                                                    key={level.value}
                                                    value={level.value}
                                                    onSelect={() => toggleSelection(level.value)}
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedValues.includes(level.value) ? 'bg-primary border-primary' : 'border-input'
                                                            }`}>
                                                            {selectedValues.includes(level.value) && (
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <span>{level.label}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    ))}
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected badges */}
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedValues.map((val) => {
                        const level = levels.find(l => l.value === val);
                        return (
                            <Badge key={val} variant="secondary" className="gap-1">
                                {level?.value || val}
                                <button
                                    type="button"
                                    onClick={() => removeValue(val)}
                                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

