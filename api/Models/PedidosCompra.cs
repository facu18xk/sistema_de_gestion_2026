using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class PedidosCompra
{
    public int IdPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual ICollection<PedidosComprasDetalle> PedidosComprasDetalles { get; set; } = new List<PedidosComprasDetalle>();

    public virtual ICollection<PedidosCotizacione> PedidosCotizaciones { get; set; } = new List<PedidosCotizacione>();
}
