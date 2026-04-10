using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Direccion
{
    public int IdDireccion { get; set; }

    public string Calle1 { get; set; } = null!;

    public string Calle2 { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int IdCiudad { get; set; }

    public virtual Ciudad IdCiudadNavigation { get; set; } = null!;

    public virtual ICollection<Persona> Personas { get; set; } = new List<Persona>();
}
