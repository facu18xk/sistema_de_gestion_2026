using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public partial class Pariente
{
    public int IdPariente { get; set; }

    public int IdEmpleado { get; set; }

    public string TipoRelacion { get; set; } = null!;

    public short Edad { get; set; }

    public DateOnly FechaNacimiento { get; set; }

    [Column("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [Column("Apellido")]
    public string Apellido { get; set; } = string.Empty;

    [Column("CI")]
    public string Ci { get; set; } = string.Empty;

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;
}