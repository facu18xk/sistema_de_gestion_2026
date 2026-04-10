using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class OrdenesVentasDetalle
{
    public int IdOrdenVentaDetalle { get; set; }

    public int IdOrdenVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public virtual OrdenesVenta IdOrdenVentaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
