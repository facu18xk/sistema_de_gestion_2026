"use client";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function OrdenesPagoPage() {
  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Tesorería y Bancos", href: "/banco-tesoreria/cuentas" },
          { label: "Órdenes de pago" },
        ]}
      />
      <h1 className="text-xl font-bold tracking-tight">Órdenes de pago</h1>
      <p className="text-muted-foreground mt-4 p-6 border rounded-lg bg-slate-50/50">
        Las órdenes de pago se gestionan desde Compras. Aquí se mostrarán las
        órdenes vinculadas a medios de pago bancarios cuando la API lo exponga.
      </p>
    </>
  );
}
