using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Cliente
{
    public int IdCliente { get; set; }

    public int IdPersona { get; set; }

    public string Ci { get; set; } = null!;

    public string Ruc { get; set; } = null!;

    public DateOnly FechaNacimiento { get; set; }

    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual Persona IdPersonaNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesVenta> OrdenesVenta { get; set; } = new List<OrdenesVenta>();

    public virtual ICollection<Presupuesto> Presupuestos { get; set; } = new List<Presupuesto>();
}
