import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  accent?: "blue" | "violet" | "emerald" | "amber";
}

const accentStyles = {
  blue: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
  violet: "bg-violet-500/10 text-violet-700 ring-violet-500/20",
  emerald: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
};

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  accent = "blue",
}: DashboardStatCardProps) {
  const content = (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm transition-all",
        href && "hover:border-primary/30 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
