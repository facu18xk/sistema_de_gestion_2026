namespace api.Models;

public partial class BalancesDetalle
{
    public int IdBalanceDetalle { get; set; }

    public int IdBalance { get; set; }

    public int IdCuentaContable { get; set; }

    public decimal TotalDebe { get; set; }

    public decimal TotalHaber { get; set; }

    public decimal SaldoDeudor { get; set; }

    public decimal SaldoAcreedor { get; set; }

    public virtual Balance IdBalanceNavigation { get; set; } = null!;

    public virtual CuentaContable IdCuentaContableNavigation { get; set; } = null!;
}
