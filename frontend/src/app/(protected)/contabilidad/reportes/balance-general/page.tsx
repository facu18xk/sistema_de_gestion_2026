"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReporteDataPage } from "@/components/contabilidad/reportes/reporte-data-page";
import { parsePeriodoParam } from "@/components/contabilidad/reportes/reportes-common";
import { BalanceGeneralView } from "@/components/contabilidad/reportes/reportes-views";
import { reportesContablesAPI } from "@/services/contabilidadAPI";

function BalanceGeneralContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <ReporteDataPage
      title="Balance General"
      description="Vista contable de activo, pasivo y patrimonio con validación de igualdad."
      selectedPeriodoId={periodoId}
      loadReporte={reportesContablesAPI.getBalanceGeneral}
      renderReporte={(reporte) => <BalanceGeneralView reporte={reporte} />}
    />
  );
}

export default function BalanceGeneralPage() {
  return (
    <Suspense fallback={null}>
      <BalanceGeneralContent />
    </Suspense>
  );
}
