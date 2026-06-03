using System;
using System.Collections.Generic;

namespace api.Models;

public partial class OrdenesComprasDetalle
{
    public int IdOrdenCompraDetalle { get; set; }

    public int IdOrdenCompra { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public virtual OrdenesCompra IdOrdenCompraNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
