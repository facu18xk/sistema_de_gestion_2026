"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ComboboxProps {
    items: { value: string; label: string; description?: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    emptyText: string;
    disabled?: boolean; // Propiedad añadida
}

export function Combobox({ items, value, onChange, placeholder, emptyText, disabled = false }: ComboboxProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={disabled ? false : open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled} // Aplica el estado disabled al botón
                    className={cn(
                        "w-full justify-between h-9 text-xs font-normal",
                        disabled && "opacity-75 cursor-not-allowed bg-muted" // Estilo visual cuando está deshabilitado
                    )}
                >
                    {value ? items.find((item) => item.value === value)?.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        onChange(item.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                                    {item.label}
                                    {item.description && <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}