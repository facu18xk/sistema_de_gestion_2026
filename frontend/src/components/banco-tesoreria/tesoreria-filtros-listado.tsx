"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TesoreriaFiltrosListadoProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  showDateRange?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  onFechaDesdeChange?: (value: string) => void;
  onFechaHastaChange?: (value: string) => void;
  dateFromLabel?: string;
  dateToLabel?: string;
  children?: React.ReactNode;
}

export function TesoreriaFiltrosListado({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  showDateRange = false,
  fechaDesde = "",
  fechaHasta = "",
  onFechaDesdeChange,
  onFechaHastaChange,
  dateFromLabel = "Desde",
  dateToLabel = "Hasta",
  children,
}: TesoreriaFiltrosListadoProps) {
  return (
    
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm w-full bg-white shadow-sm"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showDateRange && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">{dateFromLabel}</Label>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange?.(e.target.value)}
                className="h-9 w-[150px] bg-white"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">{dateToLabel}</Label>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange?.(e.target.value)}
                className="h-9 w-[150px] bg-white"
              />
            </div>
          </div>
        )}

        {children}
      </div>
    
  );
}