using System;

namespace api.Models;

public partial class ChequeMismoBanco
{
    public int IdChequeMismoBanco { get; set; }

    public int IdDepositoBancario { get; set; }

    public string NumeroCheque { get; set; } = null!;

    public string Librador { get; set; } = null!;

    public DateTime FechaEmision { get; set; }

    public decimal Monto { get; set; }

    public virtual DepositoBancario IdDepositoBancarioNavigation { get; set; } = null!;
}
