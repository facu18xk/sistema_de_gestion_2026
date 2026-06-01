"use client";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function ReportesTesoreriaPage() {
  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Reportes" },
        ]}
      />
      <h1 className="text-xl font-bold tracking-tight">Reportes de tesorería</h1>
      <p className="text-muted-foreground mt-4 p-6 border rounded-lg bg-slate-50/50">
        Reportes de movimientos, cheques y conciliación — en preparación.
      </p>
    </>
  );
}
