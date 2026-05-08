using System.Collections.Generic;

namespace api.Models;

public partial class ModeloAsiento
{
    public int IdModeloAsiento { get; set; }

    public int IdModulo { get; set; }

    public string TipoAsiento { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string? DetalleResumen { get; set; }

    public bool Activo { get; set; }

    public virtual Modulo IdModuloNavigation { get; set; } = null!;

    public virtual ICollection<ModelosAsientosDetalle> ModelosAsientosDetalles { get; set; } = new List<ModelosAsientosDetalle>();
}
