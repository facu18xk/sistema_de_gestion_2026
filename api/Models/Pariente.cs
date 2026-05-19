using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Pariente
{
    public int IdPariente { get; set; }

    public int IdEmpleado { get; set; }

    public string TipoRelacion { get; set; } = null!;

    public short Edad { get; set; }

    public DateOnly FechaNacimiento { get; set; }

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;
}
