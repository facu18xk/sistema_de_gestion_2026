import {
  BarChart3,
  HandCoins,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { DashboardKpiCard } from "@/components/dashboard/dashboard-kpi-card";

/** Resumen financiero del mes (datos de ejemplo hasta conectar API). */
const KPI_DATA = {
  ventasDelMes: {
    amount: 1_159_421,
    trend: { value: "+ 18%", label: "vs mes anterior", isPositive: true },
  },
  comprasDelMes: {
    amount: 327_439,
    trend: { value: "+ 12%", label: "vs mes anterior", isPositive: false },
  },
  cobroClientes: { amount: 11_702_530 },
  pagoProveedores: { amount: 3_059_140 },
};

export function DashboardKpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardKpiCard
        title="Ventas del mes"
        amount={KPI_DATA.ventasDelMes.amount}
        icon={BarChart3}
        accent="emerald"
        trend={KPI_DATA.ventasDelMes.trend}
      />
      <DashboardKpiCard
        title="Compras"
        amount={KPI_DATA.comprasDelMes.amount}
        icon={ShoppingBag}
        accent="rose"
        trend={KPI_DATA.comprasDelMes.trend}
      />
      <DashboardKpiCard
        title="Cobro a clientes"
        amount={KPI_DATA.cobroClientes.amount}
        icon={HandCoins}
        accent="sky"
      />
      <DashboardKpiCard
        title="Pago a proveedores"
        amount={KPI_DATA.pagoProveedores.amount}
        icon={Wallet}
        accent="amber"
      />
    </div>
  );
}
