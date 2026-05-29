"use client";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function TransferenciasPage() {
  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Transferencias" },
        ]}
      />
      <h1 className="text-xl font-bold tracking-tight">Transferencias</h1>
      <p className="text-muted-foreground mt-4 p-6 border rounded-lg bg-slate-50/50">
        Módulo de transferencias entre cuentas — disponible cuando el endpoint esté
        publicado en la API.
      </p>
    </>
  );
}
