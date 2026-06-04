"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { procesosContablesAPI } from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import { EstadoProcesoContable, ProcesoContableDTO } from "@/types/types";

interface Props {
  value?: number | null;
  onChange: (proceso: ProcesoContableDTO | null) => void;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (typeof response?.data === "string") return response.data;
    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      return String((response.data as { message?: unknown }).message);
    }
  }

  return "No se pudo completar la operación.";
}

export function formatProcesoContable(proceso: ProcesoContableDTO) {
  const descripcion =
    proceso.descripcion?.trim() || `Contabilidad ${proceso.periodoAnho}`;
  return `${descripcion} - ${proceso.periodoAnho}`;
}

const estadosProcesoHabilitados: EstadoProcesoContable[] = [
  "Habilitado",
  "Abierto",
  "Activo",
  "Activa",
  "Registrado",
  "Registrada",
];

export function isProcesoContableHabilitado(
  proceso: ProcesoContableDTO | null,
) {
  if (!proceso?.estado?.trim()) return true;

  return estadosProcesoHabilitados.some(
    (estado) => estado.toLowerCase() === proceso.estado?.trim().toLowerCase(),
  );
}

export function ContabilidadProcessSelector({ value, onChange }: Props) {
  const [procesos, setProcesos] = useState<ProcesoContableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cargarProcesos = async (preferredId?: number) => {
    setIsLoading(true);
    try {
      const response = await procesosContablesAPI.getAll(1, 100);
      const ordenados = [...response.items].sort(
        (a, b) => b.periodoAnho - a.periodoAnho,
      );
      setProcesos(ordenados);

      const currentYear = new Date().getFullYear();
      const selected =
        ordenados.find((p) => p.idProcesoContable === preferredId) ??
        ordenados.find((p) => p.idProcesoContable === value) ??
        ordenados.find(
          (p) =>
            p.periodoAnho === currentYear && isProcesoContableHabilitado(p),
        ) ??
        ordenados.find((p) => isProcesoContableHabilitado(p)) ??
        ordenados[0] ??
        null;

      onChange(selected);
    } catch (error) {
      console.error("Error al cargar procesos contables:", error);
      notify.error("Error de conexión", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarProcesos();
  }, []);

  const selectedValue = value ? String(value) : "none";

  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="grid gap-2">
        <span className="text-sm font-medium">Proceso contable</span>
        <Select
          value={selectedValue}
          onValueChange={(id) => {
            if (id === "none") {
              onChange(null);
              return;
            }
            const selected =
              procesos.find((p) => p.idProcesoContable === Number(id)) ?? null;
            onChange(selected);
          }}
          disabled={isLoading || procesos.length === 0}
        >
          <SelectTrigger className="h-9 w-full min-w-[260px] rounded-md sm:w-fit">
            <SelectValue
              placeholder={isLoading ? "Cargando..." : "Seleccionar proceso"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Seleccionar proceso contable</SelectItem>
            {procesos.map((proceso) => (
              <SelectItem
                key={proceso.idProcesoContable}
                value={String(proceso.idProcesoContable)}
              >
                {formatProcesoContable(proceso)}
                {proceso.estado ? ` (${proceso.estado})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
