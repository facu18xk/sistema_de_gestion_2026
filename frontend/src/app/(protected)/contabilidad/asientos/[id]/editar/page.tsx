"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { AsientoForm } from "@/components/contabilidad/asiento-form";
import {
  asientosAPI,
  asientosDetallesAPI,
  periodosContablesAPI,
} from "@/services/contabilidadAPI";
import { notify } from "@/lib/notifications";
import {
  AsientoDTO,
  AsientoDetalleDTO,
  PeriodoContableDTO,
} from "@/types/types";

export default function EditarAsientoPage() {
  const params = useParams<{ id: string }>();
  const idAsiento = Number(params.id);
  const [asiento, setAsiento] = useState<AsientoDTO | null>(null);
  const [detalles, setDetalles] = useState<AsientoDetalleDTO[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoContableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarAsiento = async () => {
      setIsLoading(true);
      try {
        const [asientoResponse, detallesResponse, periodosResponse] =
          await Promise.all([
            asientosAPI.getById(idAsiento),
            asientosDetallesAPI.getAll(1, 1000),
            periodosContablesAPI.getAll(1, 1000),
          ]);

        setAsiento(asientoResponse);
        setDetalles(
          detallesResponse.items
            .filter((detalle) => detalle.idAsiento === idAsiento)
            .sort((a, b) => a.item - b.item),
        );
        setPeriodos(periodosResponse.items);
      } catch (error) {
        console.error("Error al cargar asiento:", error);
        notify.error(
          "Error de conexión",
          "No se pudo obtener el asiento contable.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (Number.isFinite(idAsiento)) {
      cargarAsiento();
    }
  }, [idAsiento]);

  const initialProcesoId = useMemo(() => {
    if (!asiento?.idPeriodoContable) return null;
    return (
      periodos.find(
        (periodo) => periodo.idPeriodoContable === asiento.idPeriodoContable,
      )?.idProcesoContable ?? null
    );
  }, [asiento, periodos]);

  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Contabilidad", href: "#" },
          { label: "Asientos", href: "/contabilidad/asientos" },
          { label: "Editar" },
        ]}
      />
      <PageHeader title="Editar Asiento" />

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : asiento ? (
        <AsientoForm
          asientoEditado={asiento}
          detallesEditados={detalles}
          initialProcesoId={initialProcesoId}
        />
      ) : (
        <div className="rounded-md border bg-white p-4 text-sm text-muted-foreground">
          No se encontró el asiento contable solicitado.
        </div>
      )}
    </>
  );
}
