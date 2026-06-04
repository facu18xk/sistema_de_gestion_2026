"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReporteDataPage } from "@/components/contabilidad/reportes/reporte-data-page";
import { parsePeriodoParam } from "@/components/contabilidad/reportes/reportes-common";
import { LibroMayorView } from "@/components/contabilidad/reportes/reportes-views";
import { reportesContablesAPI } from "@/services/contabilidadAPI";

function LibroMayorContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <ReporteDataPage
      title="Libro Mayor"
      description="Vista contable de movimientos, saldos anteriores y saldos finales por cuenta."
      selectedPeriodoId={periodoId}
      loadReporte={reportesContablesAPI.getLibroMayor}
      renderReporte={(reporte) => <LibroMayorView reporte={reporte} />}
    />
  );
}

export default function LibroMayorPage() {
  return (
    <Suspense fallback={null}>
      <LibroMayorContent />
    </Suspense>
  );
}
