using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Estado
{
    public int IdEstado { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<OrdenesCompra> OrdenesCompras { get; set; } = new List<OrdenesCompra>();

    public virtual ICollection<OrdenesPagosCompra> OrdenesPagosCompras { get; set; } = new List<OrdenesPagosCompra>();

    public virtual ICollection<OrdenesVenta> OrdenesVenta { get; set; } = new List<OrdenesVenta>();

    public virtual ICollection<PedidosCompra> PedidosCompras { get; set; } = new List<PedidosCompra>();

    public virtual ICollection<PedidosCotizaciones> PedidosCotizaciones { get; set; } = new List<PedidosCotizaciones>();

    public virtual ICollection<Presupuesto> Presupuestos { get; set; } = new List<Presupuesto>();
}
