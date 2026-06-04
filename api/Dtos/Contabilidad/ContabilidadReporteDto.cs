namespace api.Dtos.Contabilidad;

public class ReporteContableCabeceraDto
{
    public int IdPeriodoContable { get; set; }
    public int IdProcesoContable { get; set; }
    public int Anho { get; set; }
    public int Mes { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public DateTime FechaEmision { get; set; }
    public string? Moneda { get; set; }
}

public class LibroDiarioReporteDto
{
    public ReporteContableCabeceraDto Cabecera { get; set; } = new();
    public List<LibroDiarioAsientoDto> Asientos { get; set; } = new();
    public LibroDiarioTotalesDto Totales { get; set; } = new();
}

public class LibroDiarioAsientoDto
{
    public int IdAsiento { get; set; }
    public int NumeroAsiento { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public string? ReferenciaOrigen { get; set; }
    public int? IdOrigen { get; set; }
    public List<LibroDiarioLineaDto> Lineas { get; set; } = new();
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public bool Cuadra { get; set; }
}

public class LibroDiarioLineaDto
{
    public int IdAsientoDetalle { get; set; }
    public int Item { get; set; }
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}

public class LibroDiarioTotalesDto
{
    public int CantidadAsientos { get; set; }
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public bool Cuadra { get; set; }
}

public class LibroMayorReporteDto
{
    public ReporteContableCabeceraDto Cabecera { get; set; } = new();
    public List<LibroMayorCuentaDto> Cuentas { get; set; } = new();
    public LibroMayorTotalesDto Totales { get; set; } = new();
}

public class LibroMayorCuentaDto
{
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public decimal SaldoAnterior { get; set; }
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoFinal { get; set; }
    public decimal SaldoDeudor { get; set; }
    public decimal SaldoAcreedor { get; set; }
    public List<LibroMayorMovimientoDto> Movimientos { get; set; } = new();
}

public class LibroMayorMovimientoDto
{
    public int IdAsiento { get; set; }
    public int NumeroAsiento { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public string? Referencia { get; set; }
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
    public decimal Saldo { get; set; }
}

public class LibroMayorTotalesDto
{
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal TotalSaldoDeudor { get; set; }
    public decimal TotalSaldoAcreedor { get; set; }
    public bool Cuadra { get; set; }
}

public class BalanceSumasYSaldosReporteDto
{
    public ReporteContableCabeceraDto Cabecera { get; set; } = new();
    public List<BalanceSumasYSaldosLineaDto> Lineas { get; set; } = new();
    public BalanceSumasYSaldosTotalesDto Totales { get; set; } = new();
}

public class BalanceSumasYSaldosLineaDto
{
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public decimal SaldoAnterior { get; set; }
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoDeudor { get; set; }
    public decimal SaldoAcreedor { get; set; }
}

public class BalanceSumasYSaldosTotalesDto
{
    public decimal SaldoAnteriorDeudor { get; set; }
    public decimal SaldoAnteriorAcreedor { get; set; }
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal TotalSaldoDeudor { get; set; }
    public decimal TotalSaldoAcreedor { get; set; }
    public bool CuadraMovimientos { get; set; }
    public bool CuadraSaldos { get; set; }
}

public class BalanceGeneralReporteDto
{
    public ReporteContableCabeceraDto Cabecera { get; set; } = new();
    public List<BalanceGeneralSeccionDto> Secciones { get; set; } = new();
    public BalanceGeneralTotalesDto Totales { get; set; } = new();
}

public class BalanceGeneralSeccionDto
{
    public string Seccion { get; set; } = string.Empty;
    public List<BalanceGeneralLineaDto> Lineas { get; set; } = new();
    public decimal Total { get; set; }
}

public class BalanceGeneralLineaDto
{
    public int? IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
    public bool EsResultadoDelEjercicio { get; set; }
}

public class BalanceGeneralTotalesDto
{
    public decimal TotalActivo { get; set; }
    public decimal TotalPasivo { get; set; }
    public decimal TotalPatrimonio { get; set; }
    public decimal TotalPasivoPatrimonio { get; set; }
    public decimal Diferencia { get; set; }
    public bool Cuadra { get; set; }
}

public class BalanceResultadosReporteDto
{
    public ReporteContableCabeceraDto Cabecera { get; set; } = new();
    public List<BalanceResultadosSeccionDto> Secciones { get; set; } = new();
    public BalanceResultadosTotalesDto Totales { get; set; } = new();
}

public class BalanceResultadosSeccionDto
{
    public string Seccion { get; set; } = string.Empty;
    public List<BalanceResultadosLineaDto> Lineas { get; set; } = new();
    public decimal Total { get; set; }
}

public class BalanceResultadosLineaDto
{
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
}

public class BalanceResultadosTotalesDto
{
    public decimal TotalIngresos { get; set; }
    public decimal TotalCostosGastos { get; set; }
    public decimal ResultadoNeto { get; set; }
}
