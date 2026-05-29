import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPanel({
  title,
  subtitle,
  action,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white shadow-sm",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
