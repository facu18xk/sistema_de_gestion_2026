using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Paise
{
    public int IdPais { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Ciudade> Ciudades { get; set; } = new List<Ciudade>();
}
