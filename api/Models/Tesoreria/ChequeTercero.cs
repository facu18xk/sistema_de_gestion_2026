using System;

namespace api.Models;

public partial class ChequeTercero
{
    public int IdChequeTercero { get; set; }

    public int IdDepositoBancario { get; set; }

    public string BancoEmisor { get; set; } = null!;

    public string NumeroCheque { get; set; } = null!;

    public string Librador { get; set; } = null!;

    public DateTime FechaEmision { get; set; }

    public decimal Monto { get; set; }

    public string Estado { get; set; } = "Pendiente";

    public virtual DepositoBancario IdDepositoBancarioNavigation { get; set; } = null!;
}
