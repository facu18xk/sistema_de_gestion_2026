using api.Dtos.Contabilidad;
using api.Models;

namespace api.Services;

public sealed record ContabilidadReporteBaseData(
    ReporteContableCabeceraDto Cabecera,
    List<CuentaContable> Cuentas,
    List<MovimientoContableReporteData> MovimientosAnteriores,
    List<MovimientoContableReporteData> MovimientosPeriodo,
    List<MovimientoContableReporteData> MovimientosHastaFin);

public sealed record MovimientoContableReporteData(
    int IdAsientoDetalle,
    int IdAsiento,
    int NumeroAsiento,
    DateOnly Fecha,
    string? DescripcionAsiento,
    string? ReferenciaOrigen,
    int? IdOrigen,
    int IdCuentaContable,
    string NumeroCuenta,
    string CuentaContable,
    string TipoCuenta,
    int Item,
    string TipoMovimiento,
    string? DescripcionDetalle,
    decimal Debe,
    decimal Haber);

public static class ContabilidadReportesCalculator
{
    public static LibroDiarioReporteDto BuildLibroDiario(ContabilidadReporteBaseData reporte)
    {
        var asientos = reporte.MovimientosPeriodo
            .GroupBy(item => new
            {
                item.IdAsiento,
                item.NumeroAsiento,
                item.Fecha,
                item.DescripcionAsiento,
                item.ReferenciaOrigen,
                item.IdOrigen
            })
            .OrderBy(group => group.Key.Fecha)
            .ThenBy(group => group.Key.NumeroAsiento)
            .Select(group =>
            {
                var lineas = group
                    .OrderBy(item => item.Item)
                    .Select(item => new LibroDiarioLineaDto
                    {
                        IdAsientoDetalle = item.IdAsientoDetalle,
                        Item = item.Item,
                        IdCuentaContable = item.IdCuentaContable,
                        NumeroCuenta = item.NumeroCuenta,
                        CuentaContable = item.CuentaContable,
                        Descripcion = item.DescripcionDetalle ?? item.DescripcionAsiento,
                        TipoMovimiento = item.TipoMovimiento,
                        Debe = item.Debe,
                        Haber = item.Haber
                    })
                    .ToList();

                var totalDebe = lineas.Sum(item => item.Debe);
                var totalHaber = lineas.Sum(item => item.Haber);

                return new LibroDiarioAsientoDto
                {
                    IdAsiento = group.Key.IdAsiento,
                    NumeroAsiento = group.Key.NumeroAsiento,
                    Fecha = group.Key.Fecha,
                    Descripcion = group.Key.DescripcionAsiento,
                    ReferenciaOrigen = group.Key.ReferenciaOrigen,
                    IdOrigen = group.Key.IdOrigen,
                    Lineas = lineas,
                    TotalDebe = totalDebe,
                    TotalHaber = totalHaber,
                    Cuadra = totalDebe == totalHaber
                };
            })
            .ToList();

        var reporteDto = new LibroDiarioReporteDto
        {
            Cabecera = reporte.Cabecera,
            Asientos = asientos,
            Totales = new LibroDiarioTotalesDto
            {
                CantidadAsientos = asientos.Count,
                TotalDebe = asientos.Sum(item => item.TotalDebe),
                TotalHaber = asientos.Sum(item => item.TotalHaber)
            }
        };

        reporteDto.Totales.Cuadra = reporteDto.Totales.TotalDebe == reporteDto.Totales.TotalHaber
            && asientos.All(item => item.Cuadra);

        return reporteDto;
    }

    public static LibroMayorReporteDto BuildLibroMayor(ContabilidadReporteBaseData reporte)
    {
        var movimientosPorCuenta = reporte.MovimientosPeriodo
            .GroupBy(item => item.IdCuentaContable)
            .ToDictionary(group => group.Key, group => group.OrderBy(item => item.Fecha)
                .ThenBy(item => item.NumeroAsiento)
                .ThenBy(item => item.Item)
                .ToList());

        var cuentas = new List<LibroMayorCuentaDto>();

        foreach (var cuenta in reporte.Cuentas)
        {
            var saldoAnterior = GetSaldoDebitoCredito(reporte.MovimientosAnteriores, cuenta.IdCuentaContable);
            movimientosPorCuenta.TryGetValue(cuenta.IdCuentaContable, out var movimientosCuenta);
            movimientosCuenta ??= new List<MovimientoContableReporteData>();

            if (saldoAnterior == 0 && movimientosCuenta.Count == 0)
            {
                continue;
            }

            var saldo = saldoAnterior;
            var movimientos = new List<LibroMayorMovimientoDto>();

            foreach (var movimiento in movimientosCuenta)
            {
                saldo += movimiento.Debe - movimiento.Haber;
                movimientos.Add(new LibroMayorMovimientoDto
                {
                    IdAsiento = movimiento.IdAsiento,
                    NumeroAsiento = movimiento.NumeroAsiento,
                    Fecha = movimiento.Fecha,
                    Descripcion = movimiento.DescripcionDetalle ?? movimiento.DescripcionAsiento,
                    Referencia = BuildReferencia(movimiento.ReferenciaOrigen, movimiento.IdOrigen),
                    Debe = movimiento.Debe,
                    Haber = movimiento.Haber,
                    Saldo = saldo
                });
            }

            var totalDebe = movimientosCuenta.Sum(item => item.Debe);
            var totalHaber = movimientosCuenta.Sum(item => item.Haber);
            var saldoFinal = saldoAnterior + totalDebe - totalHaber;

            cuentas.Add(new LibroMayorCuentaDto
            {
                IdCuentaContable = cuenta.IdCuentaContable,
                NumeroCuenta = cuenta.NumeroCuenta,
                CuentaContable = cuenta.Nombre,
                TipoCuenta = cuenta.TipoCuenta,
                SaldoAnterior = saldoAnterior,
                TotalDebe = totalDebe,
                TotalHaber = totalHaber,
                SaldoFinal = saldoFinal,
                SaldoDeudor = saldoFinal > 0 ? saldoFinal : 0,
                SaldoAcreedor = saldoFinal < 0 ? Math.Abs(saldoFinal) : 0,
                Movimientos = movimientos
            });
        }

        var totales = new LibroMayorTotalesDto
        {
            TotalDebe = cuentas.Sum(item => item.TotalDebe),
            TotalHaber = cuentas.Sum(item => item.TotalHaber),
            TotalSaldoDeudor = cuentas.Sum(item => item.SaldoDeudor),
            TotalSaldoAcreedor = cuentas.Sum(item => item.SaldoAcreedor)
        };
        totales.Cuadra = totales.TotalDebe == totales.TotalHaber
            && totales.TotalSaldoDeudor == totales.TotalSaldoAcreedor;

        return new LibroMayorReporteDto
        {
            Cabecera = reporte.Cabecera,
            Cuentas = cuentas.OrderBy(item => item.NumeroCuenta).ToList(),
            Totales = totales
        };
    }

    public static BalanceSumasYSaldosReporteDto BuildBalanceSumasYSaldos(ContabilidadReporteBaseData reporte)
    {
        var lineas = reporte.Cuentas
            .Select(cuenta =>
            {
                var saldoAnterior = GetSaldoDebitoCredito(reporte.MovimientosAnteriores, cuenta.IdCuentaContable);
                var totalDebe = reporte.MovimientosPeriodo
                    .Where(item => item.IdCuentaContable == cuenta.IdCuentaContable)
                    .Sum(item => item.Debe);
                var totalHaber = reporte.MovimientosPeriodo
                    .Where(item => item.IdCuentaContable == cuenta.IdCuentaContable)
                    .Sum(item => item.Haber);
                var saldoFinal = saldoAnterior + totalDebe - totalHaber;

                return new BalanceSumasYSaldosLineaDto
                {
                    IdCuentaContable = cuenta.IdCuentaContable,
                    NumeroCuenta = cuenta.NumeroCuenta,
                    CuentaContable = cuenta.Nombre,
                    TipoCuenta = cuenta.TipoCuenta,
                    SaldoAnterior = saldoAnterior,
                    TotalDebe = totalDebe,
                    TotalHaber = totalHaber,
                    SaldoDeudor = saldoFinal > 0 ? saldoFinal : 0,
                    SaldoAcreedor = saldoFinal < 0 ? Math.Abs(saldoFinal) : 0
                };
            })
            .Where(item => item.SaldoAnterior != 0 || item.TotalDebe != 0 || item.TotalHaber != 0
                || item.SaldoDeudor != 0 || item.SaldoAcreedor != 0)
            .OrderBy(item => item.NumeroCuenta)
            .ToList();

        var totales = new BalanceSumasYSaldosTotalesDto
        {
            SaldoAnteriorDeudor = lineas.Where(item => item.SaldoAnterior > 0).Sum(item => item.SaldoAnterior),
            SaldoAnteriorAcreedor = lineas.Where(item => item.SaldoAnterior < 0).Sum(item => Math.Abs(item.SaldoAnterior)),
            TotalDebe = lineas.Sum(item => item.TotalDebe),
            TotalHaber = lineas.Sum(item => item.TotalHaber),
            TotalSaldoDeudor = lineas.Sum(item => item.SaldoDeudor),
            TotalSaldoAcreedor = lineas.Sum(item => item.SaldoAcreedor)
        };
        totales.CuadraMovimientos = totales.TotalDebe == totales.TotalHaber;
        totales.CuadraSaldos = totales.TotalSaldoDeudor == totales.TotalSaldoAcreedor;

        return new BalanceSumasYSaldosReporteDto
        {
            Cabecera = reporte.Cabecera,
            Lineas = lineas,
            Totales = totales
        };
    }

    public static BalanceGeneralReporteDto BuildBalanceGeneral(ContabilidadReporteBaseData reporte)
    {
        var movimientosAcumulados = reporte.MovimientosHastaFin;
        var resultadoEjercicio = CalcularResultadoEjercicio(reporte.Cuentas, movimientosAcumulados);

        var activos = BuildBalanceGeneralLineas(reporte.Cuentas, movimientosAcumulados, CuentaGrupo.Activo);
        var pasivos = BuildBalanceGeneralLineas(reporte.Cuentas, movimientosAcumulados, CuentaGrupo.Pasivo);
        var patrimonio = BuildBalanceGeneralLineas(reporte.Cuentas, movimientosAcumulados, CuentaGrupo.Patrimonio);

        if (resultadoEjercicio != 0)
        {
            patrimonio.Add(new BalanceGeneralLineaDto
            {
                CuentaContable = "Resultado del ejercicio",
                TipoCuenta = "patrimonio",
                Saldo = resultadoEjercicio,
                EsResultadoDelEjercicio = true
            });
        }

        var totalActivo = activos.Sum(item => item.Saldo);
        var totalPasivo = pasivos.Sum(item => item.Saldo);
        var totalPatrimonio = patrimonio.Sum(item => item.Saldo);
        var totalPasivoPatrimonio = totalPasivo + totalPatrimonio;

        return new BalanceGeneralReporteDto
        {
            Cabecera = reporte.Cabecera,
            Secciones = new List<BalanceGeneralSeccionDto>
            {
                new()
                {
                    Seccion = "Activo",
                    Lineas = activos.OrderBy(item => item.NumeroCuenta).ToList(),
                    Total = totalActivo
                },
                new()
                {
                    Seccion = "Pasivo",
                    Lineas = pasivos.OrderBy(item => item.NumeroCuenta).ToList(),
                    Total = totalPasivo
                },
                new()
                {
                    Seccion = "Patrimonio",
                    Lineas = patrimonio.OrderBy(item => item.EsResultadoDelEjercicio)
                        .ThenBy(item => item.NumeroCuenta)
                        .ToList(),
                    Total = totalPatrimonio
                }
            },
            Totales = new BalanceGeneralTotalesDto
            {
                TotalActivo = totalActivo,
                TotalPasivo = totalPasivo,
                TotalPatrimonio = totalPatrimonio,
                TotalPasivoPatrimonio = totalPasivoPatrimonio,
                Diferencia = totalActivo - totalPasivoPatrimonio,
                Cuadra = totalActivo == totalPasivoPatrimonio
            }
        };
    }

    public static BalanceResultadosReporteDto BuildBalanceResultados(ContabilidadReporteBaseData reporte)
    {
        var movimientosAcumulados = reporte.MovimientosHastaFin;
        var ingresos = BuildBalanceResultadoLineas(reporte.Cuentas, movimientosAcumulados, CuentaGrupo.Ingreso);
        var costosGastos = BuildBalanceResultadoLineas(reporte.Cuentas, movimientosAcumulados, CuentaGrupo.Egreso);
        var totalIngresos = ingresos.Sum(item => item.Saldo);
        var totalCostosGastos = costosGastos.Sum(item => item.Saldo);

        return new BalanceResultadosReporteDto
        {
            Cabecera = reporte.Cabecera,
            Secciones = new List<BalanceResultadosSeccionDto>
            {
                new()
                {
                    Seccion = "Ingresos",
                    Lineas = ingresos.OrderBy(item => item.NumeroCuenta).ToList(),
                    Total = totalIngresos
                },
                new()
                {
                    Seccion = "Costos y gastos",
                    Lineas = costosGastos.OrderBy(item => item.NumeroCuenta).ToList(),
                    Total = totalCostosGastos
                }
            },
            Totales = new BalanceResultadosTotalesDto
            {
                TotalIngresos = totalIngresos,
                TotalCostosGastos = totalCostosGastos,
                ResultadoNeto = totalIngresos - totalCostosGastos
            }
        };
    }

    private static decimal GetSaldoDebitoCredito(IEnumerable<MovimientoContableReporteData> movimientos, int idCuentaContable)
    {
        return movimientos
            .Where(item => item.IdCuentaContable == idCuentaContable)
            .Sum(item => item.Debe - item.Haber);
    }

    private static List<BalanceGeneralLineaDto> BuildBalanceGeneralLineas(
        IEnumerable<CuentaContable> cuentas,
        IEnumerable<MovimientoContableReporteData> movimientos,
        CuentaGrupo grupo)
    {
        return cuentas
            .Where(cuenta => ClassifyCuenta(cuenta.TipoCuenta) == grupo)
            .Select(cuenta =>
            {
                var saldoDebitoCredito = GetSaldoDebitoCredito(movimientos, cuenta.IdCuentaContable);
                var saldo = grupo == CuentaGrupo.Activo
                    ? saldoDebitoCredito
                    : -saldoDebitoCredito;

                return new BalanceGeneralLineaDto
                {
                    IdCuentaContable = cuenta.IdCuentaContable,
                    NumeroCuenta = cuenta.NumeroCuenta,
                    CuentaContable = cuenta.Nombre,
                    TipoCuenta = cuenta.TipoCuenta,
                    Saldo = saldo
                };
            })
            .Where(item => item.Saldo != 0)
            .ToList();
    }

    private static List<BalanceResultadosLineaDto> BuildBalanceResultadoLineas(
        IEnumerable<CuentaContable> cuentas,
        IEnumerable<MovimientoContableReporteData> movimientos,
        CuentaGrupo grupo)
    {
        return cuentas
            .Where(cuenta => ClassifyCuenta(cuenta.TipoCuenta) == grupo)
            .Select(cuenta =>
            {
                var saldoDebitoCredito = GetSaldoDebitoCredito(movimientos, cuenta.IdCuentaContable);
                var saldo = grupo == CuentaGrupo.Ingreso
                    ? -saldoDebitoCredito
                    : saldoDebitoCredito;

                return new BalanceResultadosLineaDto
                {
                    IdCuentaContable = cuenta.IdCuentaContable,
                    NumeroCuenta = cuenta.NumeroCuenta,
                    CuentaContable = cuenta.Nombre,
                    TipoCuenta = cuenta.TipoCuenta,
                    Saldo = saldo
                };
            })
            .Where(item => item.Saldo != 0)
            .ToList();
    }

    private static decimal CalcularResultadoEjercicio(
        IEnumerable<CuentaContable> cuentas,
        IEnumerable<MovimientoContableReporteData> movimientos)
    {
        var ingresos = BuildBalanceResultadoLineas(cuentas, movimientos, CuentaGrupo.Ingreso)
            .Sum(item => item.Saldo);
        var egresos = BuildBalanceResultadoLineas(cuentas, movimientos, CuentaGrupo.Egreso)
            .Sum(item => item.Saldo);

        return ingresos - egresos;
    }

    private static CuentaGrupo? ClassifyCuenta(string tipoCuenta)
    {
        if (IsAnyTipo(tipoCuenta, "activo"))
        {
            return CuentaGrupo.Activo;
        }

        if (IsAnyTipo(tipoCuenta, "pasivo"))
        {
            return CuentaGrupo.Pasivo;
        }

        if (IsAnyTipo(tipoCuenta, "patrimonio", "capital"))
        {
            return CuentaGrupo.Patrimonio;
        }

        if (IsAnyTipo(tipoCuenta, "ingreso", "venta"))
        {
            return CuentaGrupo.Ingreso;
        }

        if (IsAnyTipo(tipoCuenta, "gasto", "egreso", "costo"))
        {
            return CuentaGrupo.Egreso;
        }

        return null;
    }

    private static bool IsAnyTipo(string tipoCuenta, params string[] values)
    {
        return values.Any(value => tipoCuenta.Contains(value, StringComparison.OrdinalIgnoreCase));
    }

    private static string? BuildReferencia(string? referenciaOrigen, int? idOrigen)
    {
        if (string.IsNullOrWhiteSpace(referenciaOrigen))
        {
            return idOrigen?.ToString();
        }

        return idOrigen is null
            ? referenciaOrigen
            : $"{referenciaOrigen} #{idOrigen}";
    }

    private enum CuentaGrupo
    {
        Activo,
        Pasivo,
        Patrimonio,
        Ingreso,
        Egreso
    }
}
