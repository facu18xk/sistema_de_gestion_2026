"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Banco } from "@/types/types";

interface BancoSelectorProps {
  bancos: Banco[];
  selectedId?: number;
  onSelect: (banco: Banco | null) => void;
  placeholder?: string;
  className?: string;
  soloActivos?: boolean;
}

export function BancoSelector({
  bancos,
  selectedId,
  onSelect,
  placeholder = "Seleccionar banco...",
  className,
  soloActivos = true,
}: BancoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const bancosDisponibles = useMemo(
    () => (soloActivos ? bancos.filter((b) => b.activo) : bancos),
    [bancos, soloActivos],
  );

  const bancosFiltrados = useMemo(() => {
    if (!search) return bancosDisponibles;
    const lower = search.toLowerCase();
    return bancosDisponibles.filter((b) =>
      b.nombre.toLowerCase().includes(lower),
    );
  }, [search, bancosDisponibles]);

  const bancoSeleccionado = bancosDisponibles.find((b) => b.idBanco === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between overflow-hidden h-8 text-xs font-normal",
            className,
          )}
        >
          <span className="truncate">
            {bancoSeleccionado ? bancoSeleccionado.nombre : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar banco..."
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No hay bancos que coincidan.</CommandEmpty>
            <CommandGroup>
              {bancosFiltrados.slice(0, 30).map((banco) => (
                <CommandItem
                  key={banco.idBanco}
                  onSelect={() => {
                    onSelect(banco);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === banco.idBanco ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {banco.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
