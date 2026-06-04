"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReporteDataPage } from "@/components/contabilidad/reportes/reporte-data-page";
import { parsePeriodoParam } from "@/components/contabilidad/reportes/reportes-common";
import { BalanceSumasYSaldosView } from "@/components/contabilidad/reportes/reportes-views";
import { reportesContablesAPI } from "@/services/contabilidadAPI";

function BalanceSumasYSaldosContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <ReporteDataPage
      title="Balance de Comprobación de Sumas y Saldos"
      description="Vista contable de saldos anteriores, movimientos y saldos deudores o acreedores."
      selectedPeriodoId={periodoId}
      loadReporte={reportesContablesAPI.getBalanceSumasYSaldos}
      renderReporte={(reporte) => <BalanceSumasYSaldosView reporte={reporte} />}
    />
  );
}

export default function BalanceSumasYSaldosPage() {
  return (
    <Suspense fallback={null}>
      <BalanceSumasYSaldosContent />
    </Suspense>
  );
}
