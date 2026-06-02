import { Package, Truck, ClipboardList, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const activities = [
  { label: "Por empacar", value: 12, unit: "pedidos", color: "text-sky-600", icon: Package },
  { label: "Por enviar", value: 8, unit: "pedidos", color: "text-amber-600", icon: Truck },
  { label: "Por entregar", value: 5, unit: "pedidos", color: "text-violet-600", icon: ClipboardList },
  { label: "Entregados", value: 24, unit: "pedidos", color: "text-emerald-600", icon: CircleCheck },
];

/** Franja tipo Zoho Inventory: actividad operativa del día. */
export function DashboardActivityStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {activities.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-5 text-center"
        >
          <p className={cn("text-3xl font-bold", item.color)}>{item.value}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            {item.unit}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <item.icon className="size-3.5" />
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
