import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
    value: string
    label: string
}

interface CreatableComboboxProps {
    value?: string
    onValueChange: (value: string) => void
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
}

export function CreatableCombobox({
    value = "",
    onValueChange,
    options,
    placeholder = "Pilih atau ketik...",
    searchPlaceholder = "Cari atau tambah...",
    emptyMessage = "Tidak ditemukan.",
    disabled = false,
    className,
}: CreatableComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    // We allow the value itself to be custom, not necessarily an option value.
    // So the displayed text on the button is just the value if it's not empty, otherwise placeholder.

    const handleSelect = (currentValue: string) => {
        onValueChange(currentValue)
        setOpen(false)
        setInputValue("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", !value && "text-muted-foreground", className)}
                    disabled={disabled}
                >
                    <span className="truncate">{value || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput 
                        placeholder={searchPlaceholder} 
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {inputValue ? (
                                <div 
                                    className="px-2 py-4 flex items-center justify-center cursor-pointer hover:bg-accent text-sm"
                                    onClick={() => handleSelect(inputValue)}
                                >
                                    Gunakan "{inputValue}"
                                </div>
                            ) : (
                                emptyMessage
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                            {inputValue && !options.find(o => o.label.toLowerCase() === inputValue.toLowerCase()) && (
                                <CommandItem
                                    value={inputValue}
                                    onSelect={() => handleSelect(inputValue)}
                                >
                                    <Plus className="mr-2 h-4 w-4 opacity-70" />
                                    Gunakan "{inputValue}"
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
