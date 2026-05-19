namespace api.Models;

public partial class AsientosDetalle
{
    public int IdAsientoDetalle { get; set; }

    public int IdAsiento { get; set; }

    public int IdCuentaContable { get; set; }

    public int Item { get; set; }

    public string TipoMovimiento { get; set; } = null!;

    public decimal Monto { get; set; }

    public string? DescripcionItem { get; set; }

    public virtual Asiento IdAsientoNavigation { get; set; } = null!;

    public virtual CuentaContable IdCuentaContableNavigation { get; set; } = null!;
}
