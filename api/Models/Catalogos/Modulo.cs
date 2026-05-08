using System.Collections.Generic;

namespace api.Models;

public partial class Modulo
{
    public int IdModulo { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Asiento> Asientos { get; set; } = new List<Asiento>();

    public virtual ICollection<ModeloAsiento> ModelosAsientos { get; set; } = new List<ModeloAsiento>();
}
