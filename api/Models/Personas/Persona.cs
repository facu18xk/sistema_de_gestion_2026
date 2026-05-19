using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Persona
{
    public int IdPersona { get; set; }

    public int IdDireccion { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public string Correo { get; set; } = null!;

    public string Telefono { get; set; } = null!;

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();

    public virtual Direccion IdDireccionNavigation { get; set; } = null!;

    public virtual Proveedor? Proveedor { get; set; }
}
