namespace api.Models;

public partial class ModelosAsientosDetalle
{
    public int IdModeloAsientoDetalle { get; set; }

    public int IdModeloAsiento { get; set; }

    public int IdCuentaContable { get; set; }

    public int Item { get; set; }

    public string TipoMovimiento { get; set; } = null!;

    public string? DescripcionItem { get; set; }

    public virtual CuentaContable IdCuentaContableNavigation { get; set; } = null!;

    public virtual ModeloAsiento IdModeloAsientoNavigation { get; set; } = null!;
}
