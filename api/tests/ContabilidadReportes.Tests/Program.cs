using api.Dtos.Contabilidad;
using api.Models;
using api.Services;

var data = BuildData();

LibroDiarioSimpleBalanceado(data);
LibroMayorCalculaSaldoAnteriorYFinal(data);
BalanceSumasYSaldosCuadra(data);
BalanceGeneralAcumulaYCuadraConResultado(data);
BalanceResultadosCalculaResultadoNeto(data);
CuentasNoAsentablesNoLleganAlCalculo(data);
IpsCalculaSobreIngresosDeducibles();
BonificacionFamiliarCalculaPorHijosMenores();
HijoMayorNoAplicaBonificacion();

Console.WriteLine("Contabilidad and RRHH tests passed.");

static void LibroDiarioSimpleBalanceado(ContabilidadReporteBaseData data)
{
    var diario = ContabilidadReportesCalculator.BuildLibroDiario(data);

    AssertEqual(2, diario.Asientos.Count, "Libro diario debe listar asientos del periodo.");
    AssertEqual(500m, diario.Asientos[0].TotalDebe, "Primer asiento debe sumar debe.");
    AssertEqual(500m, diario.Asientos[0].TotalHaber, "Primer asiento debe sumar haber.");
    AssertTrue(diario.Asientos[0].Cuadra, "Primer asiento debe cuadrar.");
    AssertTrue(diario.Totales.Cuadra, "Libro diario debe cuadrar.");
}

static void LibroMayorCalculaSaldoAnteriorYFinal(ContabilidadReporteBaseData data)
{
    var mayor = ContabilidadReportesCalculator.BuildLibroMayor(data);
    var caja = mayor.Cuentas.Single(item => item.NumeroCuenta == "1.1.1");

    AssertEqual(1000m, caja.SaldoAnterior, "Mayor debe traer saldo anterior.");
    AssertEqual(500m, caja.TotalDebe, "Mayor debe sumar movimientos debe del periodo.");
    AssertEqual(200m, caja.TotalHaber, "Mayor debe sumar movimientos haber del periodo.");
    AssertEqual(1300m, caja.SaldoFinal, "Mayor debe calcular saldo final.");
    AssertEqual(2, caja.Movimientos.Count, "Mayor debe listar movimientos de la cuenta.");
}

static void BalanceSumasYSaldosCuadra(ContabilidadReporteBaseData data)
{
    var balance = ContabilidadReportesCalculator.BuildBalanceSumasYSaldos(data);

    AssertEqual(700m, balance.Totales.TotalDebe, "Balance de sumas debe totalizar debe del periodo.");
    AssertEqual(700m, balance.Totales.TotalHaber, "Balance de sumas debe totalizar haber del periodo.");
    AssertEqual(1500m, balance.Totales.TotalSaldoDeudor, "Balance debe totalizar saldos deudores.");
    AssertEqual(1500m, balance.Totales.TotalSaldoAcreedor, "Balance debe totalizar saldos acreedores.");
    AssertTrue(balance.Totales.CuadraMovimientos, "Balance debe cuadrar movimientos.");
    AssertTrue(balance.Totales.CuadraSaldos, "Balance debe cuadrar saldos.");
}

static void BalanceGeneralAcumulaYCuadraConResultado(ContabilidadReporteBaseData data)
{
    var balance = ContabilidadReportesCalculator.BuildBalanceGeneral(data);

    AssertEqual(1300m, balance.Totales.TotalActivo, "Balance general debe acumular activo.");
    AssertEqual(1000m, balance.Totales.TotalPatrimonio - 300m, "Balance general debe mantener patrimonio contable.");
    AssertEqual(1300m, balance.Totales.TotalPasivoPatrimonio, "Balance general debe sumar pasivo y patrimonio.");
    AssertEqual(0m, balance.Totales.Diferencia, "Balance general debe cuadrar.");
    AssertTrue(balance.Secciones.Single(item => item.Seccion == "Patrimonio").Lineas.Any(item => item.EsResultadoDelEjercicio && item.Saldo == 300m),
        "Balance general debe agregar resultado del ejercicio.");
}

static void BalanceResultadosCalculaResultadoNeto(ContabilidadReporteBaseData data)
{
    var resultados = ContabilidadReportesCalculator.BuildBalanceResultados(data);

    AssertEqual(500m, resultados.Totales.TotalIngresos, "Resultados debe sumar ingresos.");
    AssertEqual(200m, resultados.Totales.TotalCostosGastos, "Resultados debe sumar costos y gastos.");
    AssertEqual(300m, resultados.Totales.ResultadoNeto, "Resultados debe calcular utilidad neta.");
}

static void CuentasNoAsentablesNoLleganAlCalculo(ContabilidadReporteBaseData data)
{
    AssertFalse(data.Cuentas.Any(item => !item.EsAsentable), "La base del reporte debe excluir cuentas no asentables.");
}

static void IpsCalculaSobreIngresosDeducibles()
{
    var detalles = new List<PagoSalarioDetalle>
    {
        new() { Tipo = SalarioRules.TipoIngreso, Monto = 3_000_000m, DeducibleIps = true },
        new() { Tipo = SalarioRules.TipoIngreso, Monto = 250_000m, DeducibleIps = false },
        new() { Tipo = SalarioRules.TipoEgreso, Monto = 50_000m, DeducibleIps = false }
    };

    var ips = SalarioRules.CalcularIps(detalles, 9m);

    AssertEqual(270_000m, ips, "IPS debe calcular 9% solo sobre ingresos deducibles.");
}

static void BonificacionFamiliarCalculaPorHijosMenores()
{
    var bonificacion = SalarioRules.CalcularBonificacionFamiliar(2, 2_798_309m, 5m);

    AssertEqual(279_830.90m, bonificacion, "Bonificacion familiar debe ser 5% del salario minimo por hijo menor.");
}

static void HijoMayorNoAplicaBonificacion()
{
    var fechaCorte = new DateOnly(2026, 6, 30);
    var menor = new Pariente { TipoRelacion = "H", FechaNacimiento = new DateOnly(2010, 7, 1) };
    var mayor = new Pariente { TipoRelacion = "H", FechaNacimiento = new DateOnly(2008, 6, 30) };
    var otroPariente = new Pariente { TipoRelacion = "C", FechaNacimiento = new DateOnly(2020, 1, 1) };

    AssertTrue(SalarioRules.EsHijoMenor(menor, fechaCorte), "Hijo menor de 18 debe aplicar.");
    AssertFalse(SalarioRules.EsHijoMenor(mayor, fechaCorte), "Hijo de 18 o mas no debe aplicar.");
    AssertFalse(SalarioRules.EsHijoMenor(otroPariente, fechaCorte), "Pariente que no es hijo no debe aplicar.");
}

static ContabilidadReporteBaseData BuildData()
{
    var cabecera = new ReporteContableCabeceraDto
    {
        IdPeriodoContable = 2,
        IdProcesoContable = 1,
        Anho = 2026,
        Mes = 2,
        FechaInicio = new DateOnly(2026, 2, 1),
        FechaFin = new DateOnly(2026, 2, 28),
        FechaEmision = new DateTime(2026, 2, 28, 12, 0, 0),
        Moneda = "PYG"
    };

    var cuentas = new List<CuentaContable>
    {
        Cuenta(1, "1.1.1", "Caja", "Activo", true),
        Cuenta(2, "2.1.1", "Proveedores", "Pasivo", true),
        Cuenta(3, "3.1.1", "Capital", "Patrimonio", true),
        Cuenta(4, "4.1.1", "Ventas", "Ingreso", true),
        Cuenta(5, "5.1.1", "Costo de ventas", "Costo", true)
    };

    var anteriores = new List<MovimientoContableReporteData>
    {
        Mov(1, 1, 1, new DateOnly(2026, 1, 5), "Apertura", 1, "1.1.1", "Caja", "Activo", 1, "Debe", 1000m),
        Mov(2, 1, 1, new DateOnly(2026, 1, 5), "Apertura", 3, "3.1.1", "Capital", "Patrimonio", 2, "Haber", 1000m)
    };

    var periodo = new List<MovimientoContableReporteData>
    {
        Mov(3, 2, 1, new DateOnly(2026, 2, 10), "Venta contado", 1, "1.1.1", "Caja", "Activo", 1, "Debe", 500m, "FacturasVenta", 10),
        Mov(4, 2, 1, new DateOnly(2026, 2, 10), "Venta contado", 4, "4.1.1", "Ventas", "Ingreso", 2, "Haber", 500m, "FacturasVenta", 10),
        Mov(5, 3, 2, new DateOnly(2026, 2, 15), "Costo de venta", 5, "5.1.1", "Costo de ventas", "Costo", 1, "Debe", 200m),
        Mov(6, 3, 2, new DateOnly(2026, 2, 15), "Costo de venta", 1, "1.1.1", "Caja", "Activo", 2, "Haber", 200m)
    };

    return new ContabilidadReporteBaseData(
        cabecera,
        cuentas,
        anteriores,
        periodo,
        anteriores.Concat(periodo).OrderBy(item => item.Fecha).ThenBy(item => item.Item).ToList());
}

static CuentaContable Cuenta(int id, string numero, string nombre, string tipo, bool esAsentable)
{
    return new CuentaContable
    {
        IdCuentaContable = id,
        IdProcesoContable = 1,
        NumeroCuenta = numero,
        Nombre = nombre,
        TipoCuenta = tipo,
        EsAsentable = esAsentable,
        Activa = true
    };
}

static MovimientoContableReporteData Mov(
    int idDetalle,
    int idAsiento,
    int numeroAsiento,
    DateOnly fecha,
    string descripcion,
    int idCuenta,
    string numeroCuenta,
    string cuenta,
    string tipoCuenta,
    int item,
    string tipoMovimiento,
    decimal monto,
    string? referenciaOrigen = null,
    int? idOrigen = null)
{
    return new MovimientoContableReporteData(
        idDetalle,
        idAsiento,
        numeroAsiento,
        fecha,
        descripcion,
        referenciaOrigen,
        idOrigen,
        idCuenta,
        numeroCuenta,
        cuenta,
        tipoCuenta,
        item,
        tipoMovimiento,
        null,
        tipoMovimiento == "Debe" ? monto : 0,
        tipoMovimiento == "Haber" ? monto : 0);
}

static void AssertEqual<T>(T expected, T actual, string message)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
    {
        throw new InvalidOperationException($"{message} Expected: {expected}. Actual: {actual}.");
    }
}

static void AssertTrue(bool condition, string message)
{
    if (!condition)
    {
        throw new InvalidOperationException(message);
    }
}

static void AssertFalse(bool condition, string message)
{
    AssertTrue(!condition, message);
}
