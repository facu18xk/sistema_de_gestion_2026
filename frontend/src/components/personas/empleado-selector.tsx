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

import { Empleado } from "@/types/types";

interface EmpleadoSelectorProps {
  empleados: Empleado[];
  selectedEmpleadoId?: number;
  onSelect: (empleado: Empleado | null) => void;
}

export function EmpleadoSelector({
  empleados,
  selectedEmpleadoId,
  onSelect,
}: EmpleadoSelectorProps) {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const empleadosFiltrados = useMemo(() => {
    if (!search) return empleados;

    const lower = search.toLowerCase();

    return empleados.filter((e) =>
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(lower),
    );
  }, [search, empleados]);

  const empleadoSeleccionado = empleados.find(
    (e) => e.idEmpleado === selectedEmpleadoId,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <span className="truncate font-normal">
            {empleadoSeleccionado
              ? `${empleadoSeleccionado.nombres} ${empleadoSeleccionado.apellidos}`
              : "Seleccionar empleado"}
          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar empleado..."
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>No se encontraron empleados.</CommandEmpty>

            <CommandGroup>
              {empleadosFiltrados.slice(0, 5).map((empleado) => (
                <CommandItem
                  key={empleado.idEmpleado}
                  onSelect={() => {
                    onSelect(empleado);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedEmpleadoId === empleado.idEmpleado
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {empleado.nombres} {empleado.apellidos}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
