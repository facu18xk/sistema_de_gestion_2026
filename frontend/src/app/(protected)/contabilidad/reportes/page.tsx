"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  parsePeriodoParam,
  ReporteLinks,
  ReportePeriodoSelector,
  ReportesHeader,
} from "@/components/contabilidad/reportes/reportes-common";

function ReportesContablesContent() {
  const searchParams = useSearchParams();
  const periodoId = parsePeriodoParam(searchParams.get("periodo"));

  return (
    <div className="space-y-4">
      <ReportesHeader
        title="Reportes Contables"
        description="Seleccione un período y consulte vistas contables preparadas para revisión."
      />
      <ReportePeriodoSelector selectedPeriodoId={periodoId} />
      <ReporteLinks periodoId={periodoId} />
    </div>
  );
}

export default function ReportesContablesPage() {
  return (
    <Suspense fallback={null}>
      <ReportesContablesContent />
    </Suspense>
  );
}
