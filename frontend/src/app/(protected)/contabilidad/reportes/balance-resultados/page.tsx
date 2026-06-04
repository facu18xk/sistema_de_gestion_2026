"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReporteDataPage } from "@/components/contabilidad/reportes/reporte-data-page";
import { parsePeriodoParam } from "@/components/contabilidad/reportes/reportes-common";
import { BalanceResultadosView } from "@/components/contabilidad/reportes/reportes-views";
import { reportesContablesAPI } from "@/services/contabilidadAPI";

function BalanceResultadosContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <ReporteDataPage
      title="Balance de Resultados"
      description="Vista contable de ingresos, costos, gastos y resultado neto del ejercicio."
      selectedPeriodoId={periodoId}
      loadReporte={reportesContablesAPI.getBalanceResultados}
      renderReporte={(reporte) => <BalanceResultadosView reporte={reporte} />}
    />
  );
}

export default function BalanceResultadosPage() {
  return (
    <Suspense fallback={null}>
      <BalanceResultadosContent />
    </Suspense>
  );
}
