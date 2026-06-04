namespace api.Models;

public partial class DetalleDepositoBancario
{
    public int IdDetalleDepositoBancario { get; set; }

    public int IdDepositoBancario { get; set; }

    public decimal Monto { get; set; }

    public string? Descripcion { get; set; }

    public virtual DepositoBancario IdDepositoBancarioNavigation { get; set; } = null!;
}
