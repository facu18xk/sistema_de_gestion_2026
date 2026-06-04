using System.Collections.Generic;

namespace api.Models;

public partial class Cargo
{
    public int IdCargo { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public bool Activo { get; set; } = true;

    public virtual ICollection<EmpleadoCargo> EmpleadosCargos { get; set; } = new List<EmpleadoCargo>();
}
