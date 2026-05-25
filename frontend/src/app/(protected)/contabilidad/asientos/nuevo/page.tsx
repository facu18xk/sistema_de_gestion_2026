"use client";

import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { AsientoForm } from "@/components/contabilidad/asiento-form";

export default function NuevoAsientoPage() {
  return (
    <>
      <PageBreadcrumb
        steps={[
          { label: "Contabilidad", href: "#" },
          { label: "Asientos", href: "/contabilidad/asientos" },
          { label: "Nuevo" },
        ]}
      />
      <PageHeader title="Nuevo Asiento" />
      <AsientoForm />
    </>
  );
}
