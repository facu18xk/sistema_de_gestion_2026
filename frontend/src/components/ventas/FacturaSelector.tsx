"use client";

import { useState, useMemo } from "react";
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
import { FacturaVentaCabecera } from "@/types/types";
import { formatearNumeroFactura } from "@/utils/factura-format"; 

interface FacturaSelectorProps {
  facturas: FacturaVentaCabecera[];
  onSelectFactura: (id: number) => void;
  selectedFacturaId?: number | null;
}

export function FacturaSelector({ 
  facturas, 
  onSelectFactura, 
  selectedFacturaId 
}: FacturaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // 1. Filtramos localmente para mostrar SOLO los aprobados (idEstado === 2)
  // 2. Aplicamos el filtro de búsqueda por texto escrito por el usuario
  const facturasFiltradas = useMemo(() => {
    if (!search) return facturas;

    const lowerSearch = search.toLowerCase();
    return facturas.filter((f) => {
      const nroFormateado = formatearNumeroFactura(f.idFacturaVenta).toLowerCase();
      const idStr = f.idFacturaVenta.toString();
      const infoCliente = f.cliente ? f.cliente.toLowerCase() : ""; 

      return (
        nroFormateado.includes(lowerSearch) || 
        idStr.includes(lowerSearch) || 
        infoCliente.includes(lowerSearch)
      );
    });
  }, [search, facturas]);

  const facturaSeleccionada = facturas.find(
    (f) => f.idFacturaVenta === selectedFacturaId
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Importar desde Factura
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between overflow-hidden bg-white h-8 text-xs px-2 font-normal shadow-sm border border-amber-200 hover:bg-amber-50/20"
          >
            <span className="truncate font-medium text-slate-700">
              {facturaSeleccionada
                ? formatearNumeroFactura(facturaSeleccionada.idFacturaVenta)
                : "Buscar factura..."}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Filtrar por número o ID..."
              onValueChange={setSearch}
              className="text-xs h-9"
            />
            <CommandList>
              <CommandEmpty className="text-xs p-3 text-center text-muted-foreground">
                No se encontraron facturas coincidentes.
              </CommandEmpty>
              <CommandGroup>
                {facturasFiltradas.slice(0, 20).map((fact) => {
                  const nroFormateado = formatearNumeroFactura(fact.idFacturaVenta);
                  
                  return (
                    <CommandItem
                      key={fact.idFacturaVenta}
                      value={`${nroFormateado} ${fact.idFacturaVenta} ${fact.cliente}`}
                      onSelect={() => {
                        onSelectFactura(fact.idFacturaVenta);
                        setOpen(false); // Cierra el popover limpiamente
                        setSearch("");  // Resetea el filtro de búsqueda
                      }}
                      className="text-xs flex items-center justify-between cursor-pointer py-2 px-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-3.5 w-3.5 text-amber-600",
                            selectedFacturaId === fact.idFacturaVenta
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{nroFormateado}</span>
                          <span className="text-[11px] text-muted-foreground">
                            Cliente: {fact.cliente || `ID: ${fact.idCliente}`}
                          </span>
                        </div>
                      </div>
                      
                      {/*<span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium border border-green-200 shrink-0">
                        Emitido
                      </span>*/}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}