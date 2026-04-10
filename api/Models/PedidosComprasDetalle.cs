using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class PedidosComprasDetalle
{
    public int IdPedidoCompraDetalle { get; set; }

    public int IdPedidoCompra { get; set; }

    public int IdProducto { get; set; }

    public string Categoria { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int Cantidad { get; set; }

    public virtual PedidosCompra IdPedidoCompraNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
