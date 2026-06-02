import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";

export default function CajaPage() {
  return (
    <div className="space-y-4">
      <PageBreadcrumb
        steps={[
          { label: "Banco y Tesorería", href: "/banco-tesoreria/cuentas" },
          { label: "Caja" },
        ]}
      />
      <h1 className="text-xl font-bold tracking-tight">Listado de caja</h1>
    </div>
  );
}
