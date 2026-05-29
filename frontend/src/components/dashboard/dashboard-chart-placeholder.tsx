const months = ["Oct", "Nov", "Dic", "Ene", "Feb", "Mar"];
const ventas = [62, 48, 71, 55, 88, 95];
const compras = [40, 35, 52, 44, 58, 61];

export function DashboardChartPlaceholder() {
  const max = Math.max(...ventas, ...compras);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-emerald-500" />
          Ventas
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          Compras y gastos
        </span>
      </div>
      <div className="flex h-48 items-end justify-between gap-2 sm:h-56">
        {months.map((month, i) => (
          <div
            key={month}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex h-40 w-full items-end justify-center gap-0.5 sm:h-48">
              <div
                className="w-2 rounded-t bg-emerald-500/90 sm:w-2.5"
                style={{ height: `${(ventas[i] / max) * 100}%` }}
              />
              <div
                className="w-2 rounded-t bg-rose-400/90 sm:w-2.5"
                style={{ height: `${(compras[i] / max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
              {month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
