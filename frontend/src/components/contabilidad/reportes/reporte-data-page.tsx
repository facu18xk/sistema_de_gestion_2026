"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";

import {
  getReporteErrorMessage,
  ReporteDocumentoShell,
  ReporteError,
  ReportePeriodoSelector,
  ReportesHeader,
  ReporteToolbar,
} from "@/components/contabilidad/reportes/reportes-common";
import { ReporteLoading } from "@/components/contabilidad/reportes/reportes-views";
import { notify } from "@/lib/notifications";
import type { ReporteContableBaseDTO } from "@/types/types";

interface ReporteDataPageProps<TReporte extends ReporteContableBaseDTO> {
  title: string;
  description: string;
  selectedPeriodoId: number | null;
  loadReporte: (idPeriodoContable: number) => Promise<TReporte>;
  renderReporte: (reporte: TReporte) => React.ReactNode;
}

export function ReporteDataPage<TReporte extends ReporteContableBaseDTO>({
  title,
  description,
  selectedPeriodoId,
  loadReporte,
  renderReporte,
}: ReporteDataPageProps<TReporte>) {
  const [reporte, setReporte] = useState<TReporte | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cargarReporte = useCallback(async () => {
    if (!selectedPeriodoId) {
      setReporte(null);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await loadReporte(selectedPeriodoId);
      setReporte(response);
    } catch (error) {
      console.error(`Error al cargar ${title}:`, error);
      const message = getReporteErrorMessage(error);
      setErrorMessage(message);
      notify.error("Error de conexión", message);
    } finally {
      setIsLoading(false);
    }
  }, [loadReporte, selectedPeriodoId, title]);

  useEffect(() => {
    cargarReporte();
  }, [cargarReporte]);

  return (
    <div className="space-y-4">
      <ReportesHeader title={title} description={description} />
      <ReportePeriodoSelector selectedPeriodoId={selectedPeriodoId} />
      <ReporteToolbar onReload={cargarReporte} isLoading={isLoading} />

      {!selectedPeriodoId ? (
        <div className="rounded-md border bg-white p-10 text-center text-sm text-muted-foreground shadow-sm">
          Seleccione un período contable.
        </div>
      ) : null}

      {errorMessage ? <ReporteError message={errorMessage} /> : null}
      {isLoading ? <ReporteLoading /> : null}
      {!isLoading && selectedPeriodoId && reporte ? (
        <ReporteDocumentoShell
          title={title}
          reporte={reporte}
          selectedPeriodoId={selectedPeriodoId}
        >
          {renderReporte(reporte)}
        </ReporteDocumentoShell>
      ) : null}
    </div>
  );
}
