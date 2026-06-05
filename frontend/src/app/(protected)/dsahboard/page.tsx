import {
  Briefcase,
  Calculator,
  FileText,
  Landmark,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

import { DashboardModuleCard } from "@/components/dashboard/dashboard-module-card";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";

const modules = [
  {
    title: "Clientes",
    description: "Gestionar cartera de clientes",
    href: "/ventas/clientes",
    icon: Users,
  },
  {
    title: "Presupuestos",
    description: "Crear y consultar presupuestos",
    href: "/ventas/presupuestos",
    icon: FileText,
  },
  {
    title: "Productos",
    description: "Catálogo y stock",
    href: "/stock/productos",
    icon: Package,
  },
  {
    title: "Pedidos de compra",
    description: "Seguimiento de pedidos",
    href: "/compras/pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Recursos Humanos",
    description: "Empleados y parientes",
    href: "/personas/empleados",
    icon: Briefcase,
  },
  {
    title: "Banco y Tesorería",
    description: "Listado de cuentas bancarias",
    href: "/banco-tesoreria/cuentas",
    icon: Landmark,
  },
  {
    title: "Contabilidad",
    description: "Proceso contable y periodos",
    href: "/contabilidad/proceso-contable",
    icon: Calculator,
  },
];

export default function DashboardHomePage() {
  return (
    <div className="-mx-3 rounded-xl bg-slate-100/80 p-4 sm:mx-0 sm:p-6">
      <DashboardPanel
        title="Tus módulos"
        subtitle="Accesos rápidos a las áreas principales del sistema"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <DashboardModuleCard key={module.href} {...module} />
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}
