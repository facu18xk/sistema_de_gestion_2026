"use client";

import { Loader2 } from "lucide-react";

import { formatDate } from "@/lib/format-date";
import {
  CuentaCell,
  EstadoDiferencia,
  MontoContable,
  ReporteEmptyState,
  ReporteSectionRow,
  ReporteSubtotalRow,
  ReporteTable,
  ReporteTotalRow,
  ReporteValidation,
  saldoAcreedor,
  saldoDeudor,
  sortByCodigoContable,
} from "@/components/contabilidad/reportes/reportes-common";
import type {
  BalanceGeneralLineaDTO,
  BalanceGeneralReporteDTO,
  BalanceResultadosLineaDTO,
  BalanceResultadosReporteDTO,
  BalanceSumasYSaldosLineaDTO,
  BalanceSumasYSaldosReporteDTO,
  LibroDiarioAsientoDTO,
  LibroDiarioLineaDTO,
  LibroDiarioReporteDTO,
  LibroMayorCuentaDTO,
  LibroMayorReporteDTO,
} from "@/types/types";

function amount(value?: number | null) {
  return Number(value ?? 0);
}

function sum<T>(items: T[], read: (item: T) => number | null | undefined) {
  return items.reduce((total, item) => total + amount(read(item)), 0);
}

function codigoCuenta(item: {
  cuenta?:
    | string
    | { codigo?: string | null; numeroCuenta?: string | null }
    | null;
  codigoCuenta?: string | null;
  numeroCuenta?: string | null;
}) {
  if (typeof item.cuenta === "object" && item.cuenta !== null) {
    return (
      item.cuenta.codigo ??
      item.cuenta.numeroCuenta ??
      item.codigoCuenta ??
      item.numeroCuenta ??
      ""
    );
  }

  return item.codigoCuenta ?? item.numeroCuenta ?? "";
}

function nombreCuenta(item: {
  cuenta?: string | { nombre?: string | null } | null;
  cuentaNombre?: string | null;
  nombreCuenta?: string | null;
  cuentaContable?: string | null;
}) {
  if (typeof item.cuenta === "string") return item.cuenta;
  return (
    item.cuenta?.nombre ??
    item.cuentaNombre ??
    item.nombreCuenta ??
    item.cuentaContable ??
    "Cuenta sin nombre"
  );
}

function lineasDiario(asiento: LibroDiarioAsientoDTO) {
  return asiento.lineas ?? asiento.detalles ?? [];
}

function debeLinea(linea: LibroDiarioLineaDTO) {
  if (linea.debe !== undefined) return amount(linea.debe);
  return linea.tipoMovimiento === "Debe" ? amount(linea.monto) : 0;
}

function haberLinea(linea: LibroDiarioLineaDTO) {
  if (linea.haber !== undefined) return amount(linea.haber);
  return linea.tipoMovimiento === "Haber" ? amount(linea.monto) : 0;
}

function libroDiarioAsientos(
  reporte: LibroDiarioReporteDTO | LibroDiarioLineaDTO[],
) {
  if (!Array.isArray(reporte)) {
    return reporte.asientos ?? reporte.items ?? [];
  }

  const grouped = new Map<string, LibroDiarioAsientoDTO>();

  reporte.forEach((linea) => {
    const key = String(linea.idAsiento ?? `${linea.fecha}-${linea.numeroAsiento}`);
    const current = grouped.get(key);

    if (current) {
      current.lineas = [...(current.lineas ?? []), linea];
      current.totalDebe = amount(current.totalDebe) + debeLinea(linea);
      current.totalHaber = amount(current.totalHaber) + haberLinea(linea);
      current.diferencia = amount(current.totalDebe) - amount(current.totalHaber);
      current.balanceado = Math.abs(current.diferencia) < 0.01;
      return;
    }

    const totalDebe = debeLinea(linea);
    const totalHaber = haberLinea(linea);

    grouped.set(key, {
      idAsiento: linea.idAsiento,
      numeroAsiento: linea.numeroAsiento,
      fecha: linea.fecha,
      descripcion: linea.descripcion,
      totalDebe,
      totalHaber,
      diferencia: totalDebe - totalHaber,
      balanceado: Math.abs(totalDebe - totalHaber) < 0.01,
      lineas: [linea],
    });
  });

  return [...grouped.values()];
}

type ReporteWithMoneda = { moneda?: string | null } | unknown[];

function monedaReporte(reporte: ReporteWithMoneda) {
  return Array.isArray(reporte) ? "PYG" : (reporte.moneda ?? "PYG");
}

export function ReporteLoading() {
  return (
    <div className="flex justify-center rounded-md border bg-white p-10 shadow-sm">
      <Loader2 className="animate-spin" />
    </div>
  );
}

export function LibroDiarioView({
  reporte,
}: {
  reporte: LibroDiarioReporteDTO | LibroDiarioLineaDTO[];
}) {
  const moneda = monedaReporte(reporte);
  const asientos = [...libroDiarioAsientos(reporte)].sort(
    (a, b) =>
      String(a.fecha ?? "").localeCompare(String(b.fecha ?? "")) ||
      amount(a.numeroAsiento) - amount(b.numeroAsiento),
  );

  if (asientos.length === 0) {
    return <ReporteEmptyState message="No hay asientos para el período seleccionado." />;
  }

  const totalDebe = Array.isArray(reporte)
    ? sum(asientos, (asiento) => asiento.totalDebe ?? sum(lineasDiario(asiento), debeLinea))
    : (reporte.totalDebe ?? sum(asientos, (asiento) => asiento.totalDebe ?? sum(lineasDiario(asiento), debeLinea)));
  const totalHaber = Array.isArray(reporte)
    ? sum(asientos, (asiento) => asiento.totalHaber ?? sum(lineasDiario(asiento), haberLinea))
    : (reporte.totalHaber ?? sum(asientos, (asiento) => asiento.totalHaber ?? sum(lineasDiario(asiento), haberLinea)));
  const diferencia = Array.isArray(reporte)
    ? totalDebe - totalHaber
    : (reporte.diferencia ?? totalDebe - totalHaber);

  return (
    <div className="space-y-3">
      <ReporteValidation difference={diferencia} moneda={moneda} />
      <ReporteTable>
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <Th>Fecha</Th>
            <Th>Asiento</Th>
            <Th>Código</Th>
            <Th>Cuenta / Concepto</Th>
            <Th align="right">Debe</Th>
            <Th align="right">Haber</Th>
          </tr>
        </thead>
        <tbody>
          {asientos.map((asiento) => {
            const lineas = [...lineasDiario(asiento)].sort(
              (a, b) => amount(a.item) - amount(b.item),
            );
            const asientoDebe = asiento.totalDebe ?? sum(lineas, debeLinea);
            const asientoHaber = asiento.totalHaber ?? sum(lineas, haberLinea);
            const asientoDiferencia =
              asiento.diferencia ?? asientoDebe - asientoHaber;

            return (
              <AsientoRows
                key={`${asiento.idAsiento ?? asiento.numeroAsiento}-${asiento.fecha}`}
                asiento={asiento}
                lineas={lineas}
                asientoDebe={asientoDebe}
                asientoHaber={asientoHaber}
                asientoDiferencia={asientoDiferencia}
                moneda={moneda}
              />
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-bold">
            <Td colSpan={4}>Total Libro Diario</Td>
            <Td>
              <MontoContable value={totalDebe} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={totalHaber} moneda={moneda} />
            </Td>
          </tr>
        </tfoot>
      </ReporteTable>
    </div>
  );
}

function AsientoRows({
  asiento,
  lineas,
  asientoDebe,
  asientoHaber,
  asientoDiferencia,
  moneda,
}: {
  asiento: LibroDiarioAsientoDTO;
  lineas: LibroDiarioLineaDTO[];
  asientoDebe: number;
  asientoHaber: number;
  asientoDiferencia: number;
  moneda: string;
}) {
  return (
    <>
      <ReporteSectionRow colSpan={6}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            Asiento {asiento.numeroAsiento ?? asiento.idAsiento ?? "—"} ·{" "}
            {formatDate(asiento.fecha)} · {asiento.descripcion ?? "Sin descripción"}
            {asiento.referenciaOrigen ? ` · ${asiento.referenciaOrigen}` : ""}
          </span>
          <EstadoDiferencia
            difference={asientoDiferencia}
            balanced={asiento.balanceado}
            moneda={moneda}
          />
        </div>
      </ReporteSectionRow>
      {lineas.map((linea, index) => {
        const debe = debeLinea(linea);
        const haber = haberLinea(linea);
        const isHaber = haber > 0 && debe === 0;

        return (
          <tr
            key={`${linea.idCuentaContable}-${linea.item ?? index}`}
            className="border-b border-slate-200"
          >
            <Td>{formatDate(asiento.fecha)}</Td>
            <Td className="font-mono">
              {asiento.numeroAsiento ?? asiento.idAsiento ?? "—"}
            </Td>
            <Td className="font-mono">{codigoCuenta(linea) || "—"}</Td>
            <Td>
              <div className={isHaber ? "pl-8" : undefined}>
                <p className="font-medium text-slate-900">{nombreCuenta(linea)}</p>
                <p className="text-slate-500">{linea.descripcionItem ?? "—"}</p>
              </div>
            </Td>
            <Td>
              <MontoContable value={debe} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={haber} moneda={moneda} />
            </Td>
          </tr>
        );
      })}
      <tr className="border-b border-slate-300 bg-slate-50 font-semibold">
        <Td colSpan={4}>Total asiento</Td>
        <Td>
          <MontoContable value={asientoDebe} moneda={moneda} />
        </Td>
        <Td>
          <MontoContable value={asientoHaber} moneda={moneda} />
        </Td>
      </tr>
    </>
  );
}

export function LibroMayorView({
  reporte,
}: {
  reporte: LibroMayorReporteDTO | LibroMayorCuentaDTO[];
}) {
  const moneda = monedaReporte(reporte);
  const cuentas = Array.isArray(reporte)
    ? reporte
    : (reporte.cuentas ?? reporte.items ?? []);

  if (cuentas.length === 0) {
    return <ReporteEmptyState message="No hay movimientos mayorizados para el período seleccionado." />;
  }

  return (
    <div className="space-y-5">
      {sortByCodigoContable(cuentas).map((cuenta, index) => (
        <MayorCuentaSection
          key={`${cuenta.idCuentaContable ?? codigoCuenta(cuenta)}-${index}`}
          cuenta={cuenta}
          moneda={moneda}
        />
      ))}
    </div>
  );
}

function MayorCuentaSection({
  cuenta,
  moneda,
}: {
  cuenta: LibroMayorCuentaDTO;
  moneda: string;
}) {
  const movimientos = cuenta.movimientos ?? [];
  const totalDebe = cuenta.totalDebe ?? sum(movimientos, (mov) => mov.debe);
  const totalHaber = cuenta.totalHaber ?? sum(movimientos, (mov) => mov.haber);
  const saldoFinal =
    cuenta.saldoFinal ?? amount(cuenta.saldoDeudor) - amount(cuenta.saldoAcreedor);

  return (
    <section className="space-y-2">
      <div className="border-y border-slate-900 py-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CuentaCell
            cuenta={cuenta.cuenta}
            codigo={codigoCuenta(cuenta)}
            nombre={nombreCuenta(cuenta)}
            className="min-w-[220px]"
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs md:grid-cols-4">
            <TotalInline label="Saldo anterior" value={cuenta.saldoAnterior} moneda={moneda} />
            <TotalInline label="Debe" value={totalDebe} moneda={moneda} />
            <TotalInline label="Haber" value={totalHaber} moneda={moneda} />
            <TotalInline label="Saldo final" value={saldoFinal} moneda={moneda} />
          </div>
        </div>
      </div>
      <ReporteTable>
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <Th>Fecha</Th>
            <Th>Asiento</Th>
            <Th>Concepto</Th>
            <Th align="right">Debe</Th>
            <Th align="right">Haber</Th>
            <Th align="right">Saldo Deudor</Th>
            <Th align="right">Saldo Acreedor</Th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length === 0 ? (
            <tr>
              <Td colSpan={7} className="h-14 text-center text-slate-500">
                Sin movimientos.
              </Td>
            </tr>
          ) : (
            movimientos.map((movimiento, index) => (
              <tr
                key={`${movimiento.numeroAsiento ?? movimiento.idAsiento}-${index}`}
                className="border-b border-slate-200"
              >
                <Td>{formatDate(movimiento.fecha)}</Td>
                <Td className="font-mono">
                  {movimiento.numeroAsiento ?? movimiento.idAsiento ?? "—"}
                </Td>
                <Td>
                  <p className="min-w-[240px] text-slate-900">
                    {movimiento.descripcion ?? "—"}
                  </p>
                  {movimiento.referenciaOrigen ? (
                    <p className="text-slate-500">{movimiento.referenciaOrigen}</p>
                  ) : null}
                </Td>
                <Td>
                  <MontoContable value={movimiento.debe} moneda={moneda} />
                </Td>
                <Td>
                  <MontoContable value={movimiento.haber} moneda={moneda} />
                </Td>
                <Td>
                  <MontoContable
                    value={saldoDeudor(movimiento.saldo)}
                    moneda={moneda}
                  />
                </Td>
                <Td>
                  <MontoContable
                    value={saldoAcreedor(movimiento.saldo)}
                    moneda={moneda}
                  />
                </Td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-bold">
            <Td colSpan={3}>Totales de la cuenta</Td>
            <Td>
              <MontoContable value={totalDebe} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={totalHaber} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={saldoDeudor(saldoFinal)} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={saldoAcreedor(saldoFinal)} moneda={moneda} />
            </Td>
          </tr>
        </tfoot>
      </ReporteTable>
    </section>
  );
}

export function BalanceSumasYSaldosView({
  reporte,
}: {
  reporte: BalanceSumasYSaldosReporteDTO | BalanceSumasYSaldosLineaDTO[];
}) {
  const moneda = monedaReporte(reporte);
  const lineas = Array.isArray(reporte)
    ? reporte
    : (reporte.lineas ?? reporte.items ?? []);

  if (lineas.length === 0) {
    return <ReporteEmptyState message="No hay saldos para el período seleccionado." />;
  }

  const totalDebe = Array.isArray(reporte)
    ? sum(lineas, debeBalance)
    : (reporte.totalDebe ?? sum(lineas, debeBalance));
  const totalHaber = Array.isArray(reporte)
    ? sum(lineas, haberBalance)
    : (reporte.totalHaber ?? sum(lineas, haberBalance));
  const totalSaldoDeudor = Array.isArray(reporte)
    ? sum(lineas, (linea) => linea.saldoDeudor)
    : (reporte.totalSaldoDeudor ?? sum(lineas, (linea) => linea.saldoDeudor));
  const totalSaldoAcreedor = Array.isArray(reporte)
    ? sum(lineas, (linea) => linea.saldoAcreedor)
    : (reporte.totalSaldoAcreedor ?? sum(lineas, (linea) => linea.saldoAcreedor));
  const diferencia = Array.isArray(reporte)
    ? totalDebe - totalHaber
    : (reporte.diferencia ?? totalDebe - totalHaber);

  return (
    <div className="space-y-3">
      <h2 className="text-center text-base font-bold uppercase text-slate-950">
        Balance de Comprobación de Sumas y Saldos
      </h2>
      <ReporteValidation
        difference={diferencia}
        balanced={Array.isArray(reporte) ? undefined : reporte.cuadrado}
        moneda={moneda}
      />
      <ReporteTable>
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <Th>Código</Th>
            <Th>Cuenta</Th>
            <Th align="right">Sumas Debe</Th>
            <Th align="right">Sumas Haber</Th>
            <Th align="right">Saldo Deudor</Th>
            <Th align="right">Saldo Acreedor</Th>
          </tr>
        </thead>
        <tbody>
          {sortByCodigoContable(lineas).map((linea, index) => (
            <tr key={`${codigoCuenta(linea)}-${index}`} className="border-b border-slate-200">
              <Td className="font-mono">{codigoCuenta(linea) || "—"}</Td>
              <Td>{nombreCuenta(linea)}</Td>
              <Td>
                <MontoContable value={debeBalance(linea)} moneda={moneda} />
              </Td>
              <Td>
                <MontoContable value={haberBalance(linea)} moneda={moneda} />
              </Td>
              <Td>
                <MontoContable value={linea.saldoDeudor} moneda={moneda} />
              </Td>
              <Td>
                <MontoContable value={linea.saldoAcreedor} moneda={moneda} />
              </Td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 font-bold">
            <Td colSpan={2}>Totales</Td>
            <Td>
              <MontoContable value={totalDebe} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={totalHaber} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={totalSaldoDeudor} moneda={moneda} />
            </Td>
            <Td>
              <MontoContable value={totalSaldoAcreedor} moneda={moneda} />
            </Td>
          </tr>
        </tfoot>
      </ReporteTable>
    </div>
  );
}

export function BalanceGeneralView({
  reporte,
}: {
  reporte: BalanceGeneralReporteDTO | BalanceGeneralLineaDTO[];
}) {
  const moneda = monedaReporte(reporte);
  const lineas = Array.isArray(reporte)
    ? reporte
    : (reporte.lineas ?? reporte.items ?? []);
  const activo = Array.isArray(reporte)
    ? lineas.filter((linea) => grupoLinea(linea) === "Activo")
    : (reporte.activo ?? lineas.filter((linea) => grupoLinea(linea) === "Activo"));
  const pasivo = Array.isArray(reporte)
    ? lineas.filter((linea) => grupoLinea(linea) === "Pasivo")
    : (reporte.pasivo ?? lineas.filter((linea) => grupoLinea(linea) === "Pasivo"));
  const patrimonio = Array.isArray(reporte)
    ? lineas.filter((linea) => ["Patrimonio", "Capital"].includes(grupoLinea(linea)))
    : (reporte.patrimonio ??
      lineas.filter((linea) =>
        ["Patrimonio", "Capital"].includes(grupoLinea(linea)),
      ));
  const totalActivo = Array.isArray(reporte)
    ? sum(activo, importeLinea)
    : (reporte.totalActivo ?? sum(activo, importeLinea));
  const totalPasivo = Array.isArray(reporte)
    ? sum(pasivo, importeLinea)
    : (reporte.totalPasivo ?? sum(pasivo, importeLinea));
  const totalPatrimonio = Array.isArray(reporte)
    ? sum(patrimonio, importeLinea)
    : (reporte.totalPatrimonio ?? sum(patrimonio, importeLinea));
  const totalPasivoPatrimonio = totalPasivo + totalPatrimonio;
  const diferencia = Array.isArray(reporte)
    ? totalActivo - totalPasivoPatrimonio
    : (reporte.diferencia ?? totalActivo - totalPasivoPatrimonio);

  if (activo.length + pasivo.length + patrimonio.length === 0) {
    return <ReporteEmptyState message="No hay saldos patrimoniales para el período seleccionado." />;
  }

  return (
    <div className="space-y-3">
      <ReporteValidation
        label="Activo = Pasivo + Patrimonio"
        difference={diferencia}
        balanced={Array.isArray(reporte) ? undefined : reporte.cuadrado}
        moneda={moneda}
      />
      <ReporteTable>
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100">
            <Th>Código</Th>
            <Th>Cuenta</Th>
            <Th align="right">Importe</Th>
          </tr>
        </thead>
        <tbody>
          <BalanceSection title="ACTIVO" lineas={activo} moneda={moneda} />
          <ReporteSubtotalRow
            label="Total Activo"
            value={totalActivo}
            moneda={moneda}
            colSpan={2}
          />
          <BalanceSection title="PASIVO" lineas={pasivo} moneda={moneda} />
          <ReporteSubtotalRow
            label="Total Pasivo"
            value={totalPasivo}
            moneda={moneda}
            colSpan={2}
          />
          <BalanceSection
            title="PATRIMONIO NETO"
            lineas={patrimonio}
            moneda={moneda}
          />
          <ReporteSubtotalRow
            label="Total Patrimonio Neto"
            value={totalPatrimonio}
            moneda={moneda}
            colSpan={2}
          />
          <ReporteTotalRow
            label="Total Pasivo y Patrimonio"
            value={totalPasivoPatrimonio}
            moneda={moneda}
            colSpan={2}
          />
        </tbody>
      </ReporteTable>
    </div>
  );
}

export function BalanceResultadosView({
  reporte,
}: {
  reporte: BalanceResultadosReporteDTO | BalanceResultadosLineaDTO[];
}) {
  const moneda = monedaReporte(reporte);
  const lineas = Array.isArray(reporte)
    ? reporte
    : (reporte.lineas ?? reporte.items ?? []);
  const ingresos =
    (Array.isArray(reporte) ? undefined : reporte.ingresos) ??
    lineas.filter((linea) => ["Ingreso", "Venta"].includes(grupoLinea(linea)));
  const costosGastos =
    (Array.isArray(reporte) ? undefined : reporte.costosGastos) ??
    (Array.isArray(reporte) ? undefined : reporte.gastos) ??
    lineas.filter((linea) =>
      ["Gasto", "Costo", "Costos"].includes(grupoLinea(linea)),
    );
  const costos = costosGastos.filter(isCostoLinea);
  const gastos = costosGastos.filter((linea) => !isCostoLinea(linea));
  const totalIngresos = Array.isArray(reporte)
    ? sum(ingresos, (linea) => Math.abs(importeLinea(linea)))
    : (reporte.totalIngresos ??
      sum(ingresos, (linea) => Math.abs(importeLinea(linea))));
  const totalCostos = sum(costos, (linea) => Math.abs(importeLinea(linea)));
  const totalGastos =
    ((Array.isArray(reporte) ? undefined : reporte.totalGastos) ??
      (gastos.length > 0
        ? sum(gastos, (linea) => Math.abs(importeLinea(linea)))
        : sum(costosGastos, (linea) => Math.abs(importeLinea(linea))) -
          totalCostos));
  const totalCostosGastos =
    (Array.isArray(reporte) ? undefined : reporte.totalCostosGastos) ??
    totalCostos + totalGastos;
  const resultadoBruto = totalIngresos - totalCostos;
  const resultadoNeto = Array.isArray(reporte)
    ? totalIngresos - totalCostosGastos
    : (reporte.resultadoNeto ?? totalIngresos - totalCostosGastos);

  if (ingresos.length + costosGastos.length === 0) {
    return <ReporteEmptyState message="No hay saldos de resultados para el período seleccionado." />;
  }

  return (
    <ReporteTable>
      <thead>
        <tr className="border-b border-slate-300 bg-slate-100">
          <Th>Código</Th>
          <Th>Concepto</Th>
          <Th align="right">Importe</Th>
        </tr>
      </thead>
      <tbody>
        <BalanceSection
          title="INGRESOS OPERATIVOS"
          lineas={ingresos}
          moneda={moneda}
          absolute
        />
        <ReporteSubtotalRow
          label="Total Ingresos Operativos"
          value={totalIngresos}
          moneda={moneda}
          colSpan={2}
        />
        <BalanceSection title="COSTOS" lineas={costos} moneda={moneda} absolute />
        <ReporteSubtotalRow
          label="Total Costos"
          value={totalCostos}
          moneda={moneda}
          colSpan={2}
        />
        <ReporteTotalRow
          label="Resultado Bruto"
          value={resultadoBruto}
          moneda={moneda}
          colSpan={2}
          absolute={resultadoBruto < 0}
        />
        <BalanceSection title="GASTOS" lineas={gastos} moneda={moneda} absolute />
        <ReporteSubtotalRow
          label="Total Gastos"
          value={totalGastos}
          moneda={moneda}
          colSpan={2}
        />
        <ReporteTotalRow
          label={
            resultadoNeto >= 0
              ? "Utilidad del ejercicio"
              : "Pérdida del ejercicio"
          }
          value={resultadoNeto}
          moneda={moneda}
          colSpan={2}
          absolute={resultadoNeto < 0}
        />
      </tbody>
    </ReporteTable>
  );
}

function grupoLinea(linea: BalanceGeneralLineaDTO | BalanceResultadosLineaDTO) {
  return String(linea.grupo ?? linea.tipoCuenta ?? linea.cuenta?.tipoCuenta ?? "");
}

function importeLinea(linea: BalanceGeneralLineaDTO | BalanceResultadosLineaDTO) {
  return Math.abs(
    amount(linea.importe ?? linea.saldo ?? linea.saldoDeudor ?? linea.saldoAcreedor),
  );
}

function debeBalance(linea: BalanceSumasYSaldosLineaDTO) {
  return amount(linea.debe ?? linea.totalDebe);
}

function haberBalance(linea: BalanceSumasYSaldosLineaDTO) {
  return amount(linea.haber ?? linea.totalHaber);
}

function isCostoLinea(linea: BalanceResultadosLineaDTO) {
  return ["Costo", "Costos"].includes(grupoLinea(linea));
}

function BalanceSection({
  title,
  lineas,
  moneda,
  absolute = false,
}: {
  title: string;
  lineas: (BalanceGeneralLineaDTO | BalanceResultadosLineaDTO)[];
  moneda: string;
  absolute?: boolean;
}) {
  return (
    <>
      <ReporteSectionRow colSpan={3}>{title}</ReporteSectionRow>
      {sortByCodigoContable(lineas).length === 0 ? (
        <tr className="border-b border-slate-200">
          <Td colSpan={3} className="text-slate-500">
            Sin saldos registrados.
          </Td>
        </tr>
      ) : (
        sortByCodigoContable(lineas).map((linea, index) => (
          <tr key={`${codigoCuenta(linea)}-${index}`} className="border-b border-slate-200">
            <Td className="font-mono">{codigoCuenta(linea) || "—"}</Td>
            <Td>{nombreCuenta(linea)}</Td>
            <Td>
              <MontoContable
                value={importeLinea(linea)}
                moneda={moneda}
                absolute={absolute}
              />
            </Td>
          </tr>
        ))
      )}
    </>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={
        align === "right"
          ? "px-2 py-2 text-right font-semibold uppercase text-slate-700"
          : "px-2 py-2 text-left font-semibold uppercase text-slate-700"
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`px-2 py-1.5 align-top ${className ?? ""}`}>
      {children}
    </td>
  );
}

function TotalInline({
  label,
  value,
  moneda,
}: {
  label: string;
  value?: number | null;
  moneda: string;
}) {
  return (
    <div>
      <p className="font-semibold uppercase text-slate-500">{label}</p>
      <MontoContable value={value} moneda={moneda} className="font-medium" />
    </div>
  );
}
