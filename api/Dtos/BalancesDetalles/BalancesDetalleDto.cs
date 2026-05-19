namespace api.Dtos.BalancesDetalles;

public class BalancesDetalleDto
{
    public int IdBalanceDetalle { get; set; }
    public int IdBalance { get; set; }
    public string Balance { get; set; } = string.Empty;
    public int IdCuentaContable { get; set; }
    public string CuentaContable { get; set; } = string.Empty;
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoDeudor { get; set; }
    public decimal SaldoAcreedor { get; set; }
}

public class BalancesDetalleUpsertDto
{
    public int IdBalance { get; set; }
    public int IdCuentaContable { get; set; }
    public decimal TotalDebe { get; set; }
    public decimal TotalHaber { get; set; }
    public decimal SaldoDeudor { get; set; }
    public decimal SaldoAcreedor { get; set; }
}
