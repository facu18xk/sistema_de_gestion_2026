using System;
using System.Collections.Generic;

namespace api.Models;

public partial class PeriodoContable
{
    public int IdPeriodoContable { get; set; }

    public int IdProcesoContable { get; set; }

    public int Anho { get; set; }

    public int Mes { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFin { get; set; }

    public string Estado { get; set; } = null!;

    public virtual ICollection<Asiento> Asientos { get; set; } = new List<Asiento>();

    public virtual ICollection<Balance> Balances { get; set; } = new List<Balance>();

    public virtual ProcesoContable IdProcesoContableNavigation { get; set; } = null!;
}
