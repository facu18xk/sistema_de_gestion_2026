import Link from "next/link";
import {
  Users,
  UserCheck,
  UserPlus,
  Calculator,
  CalendarDays,
  FileBarChart,
  PieChart,
  LineChart,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  ArrowRight,
  Briefcase,
  Landmark,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DashboardKpiGrid } from "@/components/dashboard/dashboard-kpi-grid";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DashboardActivityStrip } from "@/components/dashboard/dashboard-activity-strip";
import { DashboardChartPlaceholder } from "@/components/dashboard/dashboard-chart-placeholder";
import { DashboardModuleCard } from "@/components/dashboard/dashboard-module-card";
import { getUserDisplayName } from "@/lib/auth";
import { formatCurrency } from "@/lib/format-currency";
import type { User } from "@/types/types";

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const displayName = getUserDisplayName(user);

  return (
    <div className="-mx-3 space-y-6 rounded-xl bg-slate-100/80 p-4 pb-10 sm:mx-0 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Dashboard
            </h1>
            <Badge className="bg-slate-800 text-white hover:bg-slate-800">
              Administrador
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Hola, {displayName} — resumen del negocio
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString("es-PY", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
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

        <DashboardPanel
          title="Resumen de inventario"
          subtitle="Existencias actuales"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Cantidad en mano</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">1.248</p>
              <p className="text-xs text-slate-500">unidades en depósitos</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4">
              <p className="text-sm text-amber-800">Por recibir</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">186</p>
              <p className="text-xs text-amber-700">pedidos en tránsito</p>
            </div>
            <Link
              href="/stock/productos"
              className="flex items-center justify-between text-sm font-medium text-primary hover:underline"
            >
              Ver productos
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Actividad de pedidos"
        subtitle="Estado operativo — estilo resumen diario"
      >
        <DashboardActivityStrip />
      </DashboardPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardPanel title="Usuarios" subtitle="Equipo del sistema">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Registrados", value: "24", icon: Users },
              { label: "Activos", value: "18", icon: UserCheck },
              { label: "Nuevos", value: "3", icon: UserPlus },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-center"
              >
                <item.icon className="mx-auto size-5 text-slate-500" />
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {item.value}
                </p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Impuestos del mes" subtitle="Resumen fiscal">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "IVA del mes", amount: 145_200 },
              { label: "Retenciones", amount: 32_800 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-100 p-3"
              >
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardPanel title="Contabilidad">
          <div className="grid gap-3">
            <DashboardModuleCard
              title="Proceso contable"
              description="Ejercicio, niveles y moneda"
              href="/contabilidad/proceso-contable"
              icon={Calculator}
            />
            <DashboardModuleCard
              title="Periodo contable"
              description="Meses y cierres"
              href="/contabilidad/periodo-contable"
              icon={CalendarDays}
            />
          </div>
        </DashboardPanel>

        <DashboardPanel title="Reportes">
          <div className="grid gap-3">
            <DashboardModuleCard
              title="Balance general"
              description="Posición financiera"
              href="/contabilidad/reportes/balance-general"
              icon={FileBarChart}
            />
            <DashboardModuleCard
              title="Estado de resultados"
              description="Ingresos y utilidad"
              href="/contabilidad/reportes/balance-resultados"
              icon={PieChart}
            />
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel title="Accesos rápidos">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Clientes", href: "/ventas/clientes", icon: Users },
            { label: "Facturación", href: "/ventas/facturacion", icon: Wallet },
            { label: "Proveedores", href: "/compras/proveedores", icon: Truck },
            { label: "Pedidos", href: "/compras/pedidos", icon: ShoppingCart },
            { label: "Productos", href: "/stock/productos", icon: Package },
            { label: "Presupuestos", href: "/ventas/presupuestos", icon: FileBarChart },
            { label: "RRHH", href: "/personas/empleados", icon: Briefcase },
            { label: "Banco", href: "/banco-tesoreria/cuentas", icon: Landmark },
            { label: "Contabilidad", href: "/contabilidad/proceso-contable", icon: Calculator },
            { label: "Cotizaciones", href: "/compras/cotizaciones", icon: LineChart },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-4 text-center transition-colors hover:border-primary/30 hover:bg-white"
            >
              <item.icon className="size-5 text-primary" />
              <span className="text-sm font-medium text-slate-800">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}
