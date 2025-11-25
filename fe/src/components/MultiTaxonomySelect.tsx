import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TAXONOMY_LEVELS = [
    { value: "C1", label: "C1 - Mengingat", group: "Kognitif" },
    { value: "C2", label: "C2 - Memahami", group: "Kognitif" },
    { value: "C3", label: "C3 - Menerapkan", group: "Kognitif" },
    { value: "C4", label: "C4 - Menganalisis", group: "Kognitif" },
    { value: "C5", label: "C5 - Mengevaluasi", group: "Kognitif" },
    { value: "C6", label: "C6 - Mencipta", group: "Kognitif" },
    { value: "A1", label: "A1 - Menerima", group: "Afektif" },
    { value: "A2", label: "A2 - Merespon", group: "Afektif" },
    { value: "A3", label: "A3 - Menghargai", group: "Afektif" },
    { value: "A4", label: "A4 - Mengorganisasi", group: "Afektif" },
    { value: "A5", label: "A5 - Karakterisasi", group: "Afektif" },
    { value: "P1", label: "P1 - Meniru", group: "Psikomotor" },
    { value: "P2", label: "P2 - Manipulasi", group: "Psikomotor" },
    { value: "P3", label: "P3 - Presisi", group: " Psikomotor" },
    { value: "P4", label: "P4 - Artikulasi", group: "Psikomotor" },
    { value: "P5", label: "P5 - Naturalisasi", group: "Psikomotor" },
];

interface MultiTaxonomySelectProps {
    value: string; // comma-separated string from API
    onChange: (value: string[]) => void; // array for form state
}

export function MultiTaxonomySelect({ value, onChange }: MultiTaxonomySelectProps) {
    const [open, setOpen] = useState(false);

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

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
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
                    <Command>
                        <CommandInput placeholder="Cari level..." />
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandList>
                            {["Kognitif", "Afektif", "Psikomotor"].map((group) => (
                                <CommandGroup key={group} heading={group}>
                                    {TAXONOMY_LEVELS.filter(l => l.group === group).map((level) => (
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
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected badges */}
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedValues.map((val) => {
                        const level = TAXONOMY_LEVELS.find(l => l.value === val);
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

export { TAXONOMY_LEVELS };
