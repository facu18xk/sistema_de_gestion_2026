using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Empleado
{
    public int IdEmpleado { get; set; }

    public int IdPersona { get; set; }

    public string Ci { get; set; } = null!;

    public string Ruc { get; set; } = null!;

    public DateOnly FechaIngreso { get; set; }

    public virtual Persona IdPersonaNavigation { get; set; } = null!;

    public virtual ICollection<Pariente> Parientes { get; set; } = new List<Pariente>();
}
