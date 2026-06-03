using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Timbrado
{
    public int IdTimbrado { get; set; }

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinal { get; set; }

    public string Ruc { get; set; } = null!;

    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual ICollection<NotasCreditosVenta> NotasCreditosVenta { get; set; } = new List<NotasCreditosVenta>();
}
