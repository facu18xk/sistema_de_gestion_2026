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
import type { CuentaBancaria } from "@/types/types";

interface CuentaBancariaSelectorProps {
  cuentas: CuentaBancaria[];
  selectedId?: number;
  onSelect: (cuenta: CuentaBancaria | null) => void;
  placeholder?: string;
  className?: string;
  soloActivas?: boolean;
}

export function CuentaBancariaSelector({
  cuentas,
  selectedId,
  onSelect,
  placeholder = "Seleccionar cuenta bancaria...",
  className,
  soloActivas = true,
}: CuentaBancariaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const cuentasDisponibles = useMemo(
    () => (soloActivas ? cuentas.filter((c) => c.activa) : cuentas),
    [cuentas, soloActivas],
  );

  const cuentasFiltradas = useMemo(() => {
    if (!search) return cuentasDisponibles;
    const lower = search.toLowerCase();
    return cuentasDisponibles.filter(
      (c) =>
        c.banco.toLowerCase().includes(lower) ||
        c.numeroCuenta.toLowerCase().includes(lower) ||
        c.tipoCuentaBancaria.toLowerCase().includes(lower),
    );
  }, [search, cuentasDisponibles]);

  const cuentaSeleccionada = cuentasDisponibles.find(
    (c) => c.idCuentaBancaria === selectedId,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between overflow-hidden bg-gray-200",
            className,
          )}
        >
          <span className="truncate">
            {cuentaSeleccionada
              ? `${cuentaSeleccionada.banco} — ${cuentaSeleccionada.numeroCuenta}`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar por banco o número..."
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No hay cuentas que coincidan.</CommandEmpty>
            <CommandGroup>
              {cuentasFiltradas.slice(0, 30).map((cuenta) => (
                <CommandItem
                  key={cuenta.idCuentaBancaria}
                  onSelect={() => {
                    onSelect(cuenta);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === cuenta.idCuentaBancaria
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {cuenta.banco} — {cuenta.numeroCuenta}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {cuenta.tipoCuentaBancaria} · {cuenta.moneda}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
