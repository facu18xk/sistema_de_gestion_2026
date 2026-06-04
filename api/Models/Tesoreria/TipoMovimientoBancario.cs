using System.Collections.Generic;

namespace api.Models;

public partial class TipoMovimientoBancario
{
    public int IdTipoMovimientoBancario { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<MovimientoBancario> MovimientosBancarios { get; set; } = new List<MovimientoBancario>();
}
