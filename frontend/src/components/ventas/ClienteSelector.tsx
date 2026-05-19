"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Cliente } from "@/types/types";
import { formatPhone } from "@/utils/phone-format"
import { formatCI, formatRUC } from "@/utils/cedula-format"

interface ClienteSelectorProps {
  onSelect: (cliente: Cliente | null) => void;
  selectedClienteId?: number;
  clientesIniciales: Cliente[]; // Recibimos la lista completa como prop
}

export function ClienteSelector({ onSelect, selectedClienteId, clientesIniciales }: ClienteSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filtramos la lista en memoria cada vez que cambia el texto de búsqueda
  const clientesFiltrados = useMemo(() => {
    if (!search) return clientesIniciales;
    
    const lowerSearch = search.toLowerCase();
    return clientesIniciales.filter((c) => {
      const nombreCompleto = `${c.nombres} ${c.apellidos}`.toLowerCase();
      const rucCi = `${c.ruc} ${c.ci}`.toLowerCase();
      return nombreCompleto.includes(lowerSearch) || rucCi.includes(lowerSearch);
    });
  }, [search, clientesIniciales]);

  const clienteSeleccionado = clientesIniciales.find(c => c.idCliente === selectedClienteId);

  return (
    <div className="w-100">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between overflow-hidden bg-gray-200"
        >
          <span className="truncate">
            {clienteSeleccionado 
              ? `${clienteSeleccionado.nombres} ${clienteSeleccionado.apellidos}` 
              : "Seleccionar cliente..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Filtrar por nombre, RUC o CI..." 
            onValueChange={setSearch} 
          />
          <CommandList>
            <CommandEmpty>No se encontraron coincidencias.</CommandEmpty>
            <CommandGroup>
              {clientesFiltrados.slice(0, 20).map((cliente) => ( // Mostramos solo los primeros 20 por rendimiento
                <CommandItem
                  key={cliente.idCliente}
                  onSelect={() => {
                    onSelect(cliente);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClienteId === cliente.idCliente ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{cliente.nombres} {cliente.apellidos}</span>
                    <span className="text-xs text-muted-foreground">
                      Doc: {formatRUC(cliente.ruc)|| formatCI(cliente.ci)} | Tel: {formatPhone(cliente.telefono) || 'N/A'}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    </div>
  );
}