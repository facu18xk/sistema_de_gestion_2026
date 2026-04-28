using System;
using System.Collections.Generic;

namespace api.Models;

public partial class PedidosComprasDetalle
{
    public int IdPedidoCompraDetalle { get; set; }

    public int IdPedidoCompra { get; set; }

    public int IdProducto { get; set; }

    public int IdCategoria { get; set; }

    public string Descripcion { get; set; } = null!;

    public int Cantidad { get; set; }

    public virtual PedidosCompra IdPedidoCompraNavigation { get; set; } = null!;

    public virtual Categoria IdCategoriaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
