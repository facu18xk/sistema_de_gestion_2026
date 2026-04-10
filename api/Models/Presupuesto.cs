using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class Presupuesto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public DateTime FechaVencimiento { get; set; }

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesVenta> OrdenesVenta { get; set; } = new List<OrdenesVenta>();

    public virtual ICollection<PresupuestosDetalle> PresupuestosDetalles { get; set; } = new List<PresupuestosDetalle>();
}
