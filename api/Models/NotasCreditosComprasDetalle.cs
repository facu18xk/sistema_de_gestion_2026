using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class NotasCreditosComprasDetalle
{
    public int IdNotaCreditoCompraDetalle { get; set; }

    public int IdNotaCreditoCompra { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    public virtual NotasCreditosCompra IdNotaCreditoCompraNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
