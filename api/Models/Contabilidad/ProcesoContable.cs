using System;
using System.Collections.Generic;

namespace api.Models;

public partial class ProcesoContable
{
    public int IdProcesoContable { get; set; }

    public int PeriodoAnho { get; set; }

    public string? Descripcion { get; set; }

    public int? CantNiveles { get; set; }

    public int? CantDigitosNivel { get; set; }

    public string? Moneda { get; set; }

    public string? Estado { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<CuentaContable> CuentasContables { get; set; } = new List<CuentaContable>();

    public virtual ICollection<PeriodoContable> PeriodosContables { get; set; } = new List<PeriodoContable>();
}
