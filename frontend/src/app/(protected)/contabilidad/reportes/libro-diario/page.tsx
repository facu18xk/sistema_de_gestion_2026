"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReporteDataPage } from "@/components/contabilidad/reportes/reporte-data-page";
import { parsePeriodoParam } from "@/components/contabilidad/reportes/reportes-common";
import { LibroDiarioView } from "@/components/contabilidad/reportes/reportes-views";
import { reportesContablesAPI } from "@/services/contabilidadAPI";

function LibroDiarioContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <ReporteDataPage
      title="Libro Diario"
      description="Vista contable de asientos ordenados por fecha, número e item."
      selectedPeriodoId={periodoId}
      loadReporte={reportesContablesAPI.getLibroDiario}
      renderReporte={(reporte) => <LibroDiarioView reporte={reporte} />}
    />
  );
}

export default function LibroDiarioPage() {
  return (
    <Suspense fallback={null}>
      <LibroDiarioContent />
    </Suspense>
  );
}
