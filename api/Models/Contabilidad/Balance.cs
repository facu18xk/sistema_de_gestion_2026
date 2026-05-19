using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Balance
{
    public int IdBalance { get; set; }

    public string TipoBalance { get; set; } = null!;

    public int IdPeriodoContable { get; set; }

    public DateTime FechaGeneracion { get; set; }

    public virtual ICollection<BalancesDetalle> BalancesDetalles { get; set; } = new List<BalancesDetalle>();

    public virtual PeriodoContable IdPeriodoContableNavigation { get; set; } = null!;
}
