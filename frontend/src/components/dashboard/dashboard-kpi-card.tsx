import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";

export interface DashboardKpiCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: {
    value: string;
    label: string;
    /** true = verde (bueno), false = rojo (alerta) */
    isPositive?: boolean;
  };
  accent?: "emerald" | "rose" | "sky" | "amber";
}

const accentIconBg = {
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

export function DashboardKpiCard({
  title,
  amount,
  icon: Icon,
  trend,
  accent = "sky",
}: DashboardKpiCardProps) {
  const trendPositive = trend?.isPositive ?? true;

  return (
    <article className="flex min-h-[140px] flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            accentIconBg[accent]
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
        {formatCurrency(amount)}
      </p>

      {trend && (
        <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs">
          {trendPositive ? (
            <TrendingUp className="size-3.5 text-emerald-600" />
          ) : (
            <TrendingUp className="size-3.5 text-rose-600" />
          )}
          <span
            className={cn(
              "font-semibold",
              trendPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </article>
  );
}
