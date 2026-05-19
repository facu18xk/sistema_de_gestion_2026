namespace api.Dtos.Contabilidad;

public class LibroDiarioLineaDto
{
    public int IdAsiento { get; set; }
    public int NumeroAsiento { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public int Item { get; set; }
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}

public class LibroMayorCuentaDto
{
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
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
    public decimal Debe { get; set; }
    public decimal Haber { get; set; }
}

public class BalanceLineaDto
{
    public int IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string CuentaContable { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoDeudor { get; set; }
    public decimal SaldoAcreedor { get; set; }
    public decimal Saldo { get; set; }
}
