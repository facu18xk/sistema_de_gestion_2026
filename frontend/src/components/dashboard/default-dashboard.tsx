import Link from "next/link";
import {
  ShoppingCart,
  Package,
  Users,
  FileText,
  ArrowRight,
  Briefcase,
  Landmark,
  Calculator,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardActivityStrip } from "@/components/dashboard/dashboard-activity-strip";
import { DashboardChartPlaceholder } from "@/components/dashboard/dashboard-chart-placeholder";
import { DashboardModuleCard } from "@/components/dashboard/dashboard-module-card";
import { getUserDisplayName } from "@/lib/auth";
import type { User } from "@/types/types";

interface DefaultDashboardProps {
  user: User;
}

export function DefaultDashboard({ user }: DefaultDashboardProps) {
  const displayName = getUserDisplayName(user);

  return (
    <div className="-mx-3 space-y-6 rounded-xl bg-slate-100/80 p-4 pb-10 sm:mx-0 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Dashboard
            </h1>
            <Badge variant="secondary">Usuario</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Bienvenido, {displayName}
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link href="/ventas/presupuestos">
            Nuevo presupuesto
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      <DashboardKpiGrid />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardPanel
          title="Ventas vs compras y gastos"
          subtitle="Últimos 6 meses"
          className="lg:col-span-2"
        >
          <DashboardChartPlaceholder />
        </DashboardPanel>

        <DashboardPanel title="Actividad de pedidos">
          <DashboardActivityStrip />
        </DashboardPanel>
      </div>

      <DashboardPanel title="Tus módulos">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardModuleCard
            title="Clientes"
            description="Gestionar cartera de clientes"
            href="/ventas/clientes"
            icon={Users}
          />
          <DashboardModuleCard
            title="Presupuestos"
            description="Crear y consultar presupuestos"
            href="/ventas/presupuestos"
            icon={FileText}
          />
          <DashboardModuleCard
            title="Productos"
            description="Catálogo y stock"
            href="/stock/productos"
            icon={Package}
          />
          <DashboardModuleCard
            title="Pedidos de compra"
            description="Seguimiento de pedidos"
            href="/compras/pedidos"
            icon={ShoppingCart}
          />
          <DashboardModuleCard
            title="Recursos Humanos"
            description="Empleados, cargos y salarios"
            href="/personas/empleados"
            icon={Briefcase}
          />
          <DashboardModuleCard
            title="Banco y Tesorería"
            description="Listado de cuentas bancarias"
            href="/banco-tesoreria/cuentas"
            icon={Landmark}
          />
          <DashboardModuleCard
            title="Contabilidad"
            description="Proceso contable y periodos"
            href="/contabilidad/proceso-contable"
            icon={Calculator}
          />
        </div>
      </DashboardPanel>
    </div>
  );
}
