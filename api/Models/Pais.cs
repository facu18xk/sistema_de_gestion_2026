using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Pais
{
    public int IdPais { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Ciudad> Ciudades { get; set; } = new List<Ciudad>();
}
