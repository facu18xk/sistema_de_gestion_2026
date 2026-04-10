using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class OrdenesVenta
{
    public int IdOrdenVenta { get; set; }

    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual Presupuesto IdPresupuestoNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesVentasDetalle> OrdenesVentasDetalles { get; set; } = new List<OrdenesVentasDetalle>();
}
