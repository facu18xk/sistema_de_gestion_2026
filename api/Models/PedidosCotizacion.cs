using System;
using System.Collections.Generic;

namespace api.Models;

public partial class PedidosCotizaciones
{
    public int IdPedidoCotizacion { get; set; }

    public int IdPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual PedidosCompra IdPedidoCompraNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesCompra> OrdenesCompras { get; set; } = new List<OrdenesCompra>();

    public virtual ICollection<PedidosCotizacionesDetalle> PedidosCotizacionesDetalles { get; set; } = new List<PedidosCotizacionesDetalle>();
}
