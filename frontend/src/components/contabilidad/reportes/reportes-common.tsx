"use client";

import type React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, Printer, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import {
  ContabilidadProcessSelector,
  formatProcesoContable,
} from "@/components/contabilidad/contabilidad-process-selector";
import { periodosContablesAPI } from "@/services/contabilidadAPI";
import { formatDate } from "@/lib/format-date";
import { formatMoney } from "@/lib/format-currency";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type {
  PeriodoContableDTO,
  ProcesoContableDTO,
  ReporteContableBaseDTO,
  ReporteCuentaContableDTO,
} from "@/types/types";

export const reportesContables = [
  {
    href: "/contabilidad/reportes/libro-diario",
    title: "Libro Diario",
    description: "Asientos ordenados por fecha con debe, haber y diferencia.",
  },
  {
    href: "/contabilidad/reportes/libro-mayor",
    title: "Libro Mayor",
    description: "Movimientos y saldos por cuenta contable.",
  },
  {
    href: "/contabilidad/reportes/balance-sumas-saldos",
    title: "Balance de Comprobación de Sumas y Saldos",
    description: "Saldos anteriores, movimientos y saldos finales.",
  },
  {
    href: "/contabilidad/reportes/balance-general",
    title: "Balance General",
    description: "Activo, pasivo y patrimonio para revisión.",
  },
  {
    href: "/contabilidad/reportes/balance-resultados",
    title: "Balance de Resultados",
    description: "Ingresos, costos, gastos y resultado neto.",
  },
] as const;

const meses = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function getReporteErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    if (typeof response?.data === "string") return response.data;
    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      return String((response.data as { message?: unknown }).message);
    }
  }

  return "No se pudo obtener el reporte contable.";
}

export function getPeriodoLabel(periodo: PeriodoContableDTO) {
  return `${meses[periodo.mes] ?? periodo.mes} ${periodo.anho}`;
}

export function getPeriodoDetalle(periodo: PeriodoContableDTO) {
  return `${periodo.procesoContable} · ${formatDate(periodo.fechaInicio)} al ${formatDate(periodo.fechaFin)} · ${periodo.estado}`;
}

export function withPeriodo(href: string, periodoId?: number | null) {
  if (!periodoId) return href;
  return `${href}?periodo=${periodoId}`;
}

export function parsePeriodoParam(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function ReportesHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3 print:hidden">
      <PageBreadcrumb
        steps={[
          { label: "Contabilidad", href: "#" },
          { label: "Reportes Contables", href: "/contabilidad/reportes" },
          { label: title },
        ]}
      />
      <div className="space-y-1">
        <PageHeader title={title} />
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ReporteToolbar({
  onReload,
  isLoading,
}: {
  onReload?: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white p-3 shadow-sm print:hidden">
      <div>
        <p className="text-sm font-medium">Vista contable</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReload}
          disabled={isLoading || !onReload}
          className="gap-2"
        >
          <RefreshCcw className={cn("size-3.5", isLoading && "animate-spin")} />
          Recargar
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Printer className="size-3.5" />
          Imprimir
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-2">
          <Download className="size-3.5" />
          Exportar
        </Button>
      </div>
    </div>
  );
}

export function ReportePeriodoSelector({
  selectedPeriodoId,
}: {
  selectedPeriodoId: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [proceso, setProceso] = useState<ProcesoContableDTO | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoContableDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cargarPeriodos = async () => {
      setIsLoading(true);
      try {
        const response = await periodosContablesAPI.getAll(1, 1000);
        setPeriodos(
          [...response.items].sort(
            (a, b) => b.anho - a.anho || b.mes - a.mes,
          ),
        );
      } catch (error) {
        console.error("Error al cargar períodos para reportes:", error);
        notify.error("Error de conexión", getReporteErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    cargarPeriodos();
  }, []);

  const selectedPeriodo = periodos.find(
    (periodo) => periodo.idPeriodoContable === selectedPeriodoId,
  );
  const procesoId =
    proceso?.idProcesoContable ?? selectedPeriodo?.idProcesoContable;
  const periodosFiltrados = useMemo(() => {
    if (!procesoId) return periodos;
    return periodos.filter((periodo) => periodo.idProcesoContable === procesoId);
  }, [periodos, procesoId]);

  const updatePeriodo = (value: string) => {
    const params = new URLSearchParams();
    if (value !== "none") params.set("periodo", value);
    router.push(params.size ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(280px,auto)_1fr] print:hidden">
      <ContabilidadProcessSelector
        value={procesoId}
        onChange={(selected) => setProceso(selected)}
      />
      <div className="rounded-md border bg-white p-3 shadow-sm">
        <div className="grid gap-2">
          <span className="text-sm font-medium">Período contable</span>
          <Select
            value={selectedPeriodoId ? String(selectedPeriodoId) : "none"}
            onValueChange={updatePeriodo}
            disabled={isLoading || periodosFiltrados.length === 0}
          >
            <SelectTrigger className="h-9 w-full min-w-[260px] rounded-md">
              <SelectValue
                placeholder={isLoading ? "Cargando..." : "Seleccionar período"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Seleccione un período contable</SelectItem>
              {periodosFiltrados.map((periodo) => (
                <SelectItem
                  key={periodo.idPeriodoContable}
                  value={String(periodo.idPeriodoContable)}
                >
                  {getPeriodoLabel(periodo)} · {periodo.estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPeriodo ? (
            <p className="text-xs text-muted-foreground">
              {getPeriodoDetalle(selectedPeriodo)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Seleccione un período contable para consultar las vistas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReporteDocumentoShell({
  title,
  reporte,
  selectedPeriodoId,
  children,
}: {
  title: string;
  reporte?: ReporteContableBaseDTO | null;
  selectedPeriodoId: number;
  children: React.ReactNode;
}) {
  const periodo = reporte?.periodo;
  const periodoLabel =
    periodo?.mes && periodo?.anho
      ? `${meses[periodo.mes] ?? periodo.mes} ${periodo.anho}`
      : `ID ${selectedPeriodoId}`;
  const rango =
    periodo?.fechaInicio || periodo?.fechaFin
      ? `${formatDate(periodo.fechaInicio)} al ${formatDate(periodo.fechaFin)}`
      : "Rango no informado";
  const moneda = reporte?.moneda === "PYG" || !reporte?.moneda ? "Guaraníes" : reporte.moneda;
  const generadoEn = reporte?.generadoEn ? formatDate(reporte.generadoEn) : formatDate(new Date().toISOString());

  return (
    <article className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
      <header className="border-b border-slate-300 px-4 py-5 text-center print:px-0">
        <h1 className="text-xl font-bold uppercase text-slate-950">
          {title}
        </h1>
        <div className="mt-4 grid gap-2 text-left text-xs text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          <ReporteMetaItem label="Período" value={periodoLabel} />
          <ReporteMetaItem label="Rango" value={rango} />
          <ReporteMetaItem label="Moneda" value={moneda} />
          <ReporteMetaItem label="Fecha de emisión" value={generadoEn} />
        </div>
        {periodo?.estado ? (
          <p className="mt-3 text-xs text-slate-500">
            Estado del período: {periodo.estado}.
          </p>
        ) : null}
      </header>
      <div className="p-4 print:px-0">{children}</div>
    </article>
  );
}

function ReporteMetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-slate-200 pt-2">
      <p className="text-[10px] font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function ReporteTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-slate-300 bg-white">
      <table className="w-full min-w-[760px] border-collapse text-xs">
        {children}
      </table>
    </div>
  );
}

export function ReporteSectionRow({
  children,
  colSpan,
}: {
  children: React.ReactNode;
  colSpan: number;
}) {
  return (
    <tr className="border-y border-slate-300 bg-slate-100">
      <td colSpan={colSpan} className="px-2 py-2 font-bold uppercase text-slate-900">
        {children}
      </td>
    </tr>
  );
}

export function ReporteSubtotalRow({
  label,
  value,
  moneda = "PYG",
  colSpan = 1,
  absolute,
}: {
  label: string;
  value?: number | null;
  moneda?: string | null;
  colSpan?: number;
  absolute?: boolean;
}) {
  return (
    <tr className="border-t border-slate-300 bg-slate-50 font-semibold">
      <td colSpan={colSpan} className="px-2 py-2 text-slate-900">
        {label}
      </td>
      <td className="px-2 py-2">
        <MontoContable value={value} moneda={moneda} absolute={absolute} />
      </td>
    </tr>
  );
}

export function ReporteTotalRow({
  label,
  value,
  moneda = "PYG",
  colSpan = 1,
  absolute,
}: {
  label: string;
  value?: number | null;
  moneda?: string | null;
  colSpan?: number;
  absolute?: boolean;
}) {
  return (
    <tr className="border-y-2 border-slate-900 bg-white font-bold">
      <td colSpan={colSpan} className="px-2 py-2 uppercase text-slate-950">
        {label}
      </td>
      <td className="px-2 py-2">
        <MontoContable value={value} moneda={moneda} absolute={absolute} />
      </td>
    </tr>
  );
}

export function ReporteValidation({
  label = "Validación contable",
  difference,
  balanced,
  moneda = "PYG",
}: {
  label?: string;
  difference?: number | null;
  balanced?: boolean | null;
  moneda?: string | null;
}) {
  const diff = Number(difference ?? 0);
  const isBalanced = balanced ?? Math.abs(diff) < 1;

  return (
    <div
      className={cn(
        "border px-3 py-2 text-sm",
        isBalanced
          ? "border-slate-300 bg-slate-50 text-slate-800"
          : "border-red-300 bg-red-50 text-red-800",
      )}
    >
      <span className="font-semibold">{label}: </span>
      {isBalanced ? "Cuadrado" : `Diferencia ${formatMoney(Math.abs(diff), moneda ?? "PYG")}`}
    </div>
  );
}

export function formatGuaranies(value?: number | null, moneda = "PYG") {
  return formatMoney(Number(value ?? 0), moneda);
}

export function sortByCodigoContable<T extends { cuenta?: ReporteCuentaContableDTO | null; codigoCuenta?: string | null; numeroCuenta?: string | null }>(
  items: T[],
) {
  return [...items].sort((a, b) => {
    const aCode = a.cuenta?.codigo ?? a.cuenta?.numeroCuenta ?? a.codigoCuenta ?? a.numeroCuenta ?? "";
    const bCode = b.cuenta?.codigo ?? b.cuenta?.numeroCuenta ?? b.codigoCuenta ?? b.numeroCuenta ?? "";
    return aCode.localeCompare(bCode, "es", { numeric: true });
  });
}

export function saldoDeudor(value?: number | null) {
  const amount = Number(value ?? 0);
  return amount > 0 ? amount : 0;
}

export function saldoAcreedor(value?: number | null) {
  const amount = Number(value ?? 0);
  return amount < 0 ? Math.abs(amount) : 0;
}

export function ReporteMeta({
  reporte,
  selectedPeriodoId,
}: {
  reporte?: ReporteContableBaseDTO | null;
  selectedPeriodoId: number;
}) {
  const periodo = reporte?.periodo;

  return (
    <div className="grid gap-3 rounded-md border bg-white p-3 text-sm shadow-sm md:grid-cols-4">
      <div>
        <p className="text-xs text-muted-foreground">Período</p>
        <p className="font-medium">
          {periodo?.mes && periodo?.anho
            ? `${meses[periodo.mes] ?? periodo.mes} ${periodo.anho}`
            : `ID ${selectedPeriodoId}`}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Rango</p>
        <p className="font-medium">
          {periodo?.fechaInicio || periodo?.fechaFin
            ? `${formatDate(periodo.fechaInicio)} al ${formatDate(periodo.fechaFin)}`
            : "—"}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Moneda</p>
        <p className="font-medium">{reporte?.moneda ?? "PYG"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Estado</p>
        <p className="font-medium">{periodo?.estado ?? "Sin estado"}</p>
      </div>
    </div>
  );
}

export function ReporteEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border bg-white p-10 text-center text-sm text-muted-foreground shadow-sm">
      {message}
    </div>
  );
}

export function ReporteError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}

export function MontoContable({
  value,
  moneda = "PYG",
  className,
  absolute = false,
}: {
  value?: number | null;
  moneda?: string | null;
  className?: string;
  absolute?: boolean;
}) {
  const amount = Number(value ?? 0);
  return (
    <span className={cn("block text-right tabular-nums", className)}>
      {amount === 0 ? "—" : formatMoney(absolute ? Math.abs(amount) : amount, moneda ?? "PYG")}
    </span>
  );
}

export function CuentaCell({
  cuenta,
  codigo,
  nombre,
  className,
}: {
  cuenta?: ReporteCuentaContableDTO | null;
  codigo?: string | null;
  nombre?: string | null;
  className?: string;
}) {
  const code = cuenta?.codigo ?? cuenta?.numeroCuenta ?? codigo ?? "";
  const label = cuenta?.nombre ?? nombre ?? "Cuenta sin nombre";

  return (
    <div className={cn("min-w-[260px]", className)}>
      <p className="font-medium text-slate-900">{label}</p>
      {code ? <p className="font-mono text-xs text-muted-foreground">{code}</p> : null}
    </div>
  );
}

export function EstadoDiferencia({
  difference,
  balanced,
  moneda = "PYG",
}: {
  difference?: number | null;
  balanced?: boolean | null;
  moneda?: string | null;
}) {
  const diff = Number(difference ?? 0);
  const isBalanced = balanced ?? Math.abs(diff) < 1;

  if (isBalanced) {
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Cuadrado</Badge>;
  }

  return (
    <Badge variant="destructive" className="h-auto py-1">
      Diferencia {formatMoney(Math.abs(diff), moneda ?? "PYG")}
    </Badge>
  );
}

export function ReporteLinks({
  periodoId,
}: {
  periodoId: number | null;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {reportesContables.map((reporte) => (
        <Link
          key={reporte.href}
          href={withPeriodo(reporte.href, periodoId)}
          className="rounded-md border bg-white p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-slate-50"
        >
          <p className="font-semibold text-slate-900">{reporte.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {reporte.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

export function procesoLabel(proceso: ProcesoContableDTO | null) {
  return proceso ? formatProcesoContable(proceso) : "Proceso contable";
}
