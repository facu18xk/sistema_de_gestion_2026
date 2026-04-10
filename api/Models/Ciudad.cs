using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Ciudad
{
    public int IdCiudad { get; set; }

    public int IdPais { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Direccion> Direcciones { get; set; } = new List<Direccion>();

    public virtual Pais IdPaisNavigation { get; set; } = null!;
}
