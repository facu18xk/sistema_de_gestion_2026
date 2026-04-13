using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class NotasCreditosVentasDetalle
{
    public int IdNotaCreditoVentaDetalle { get; set; }

    public int IdNotaCreditoVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    public virtual NotasCreditosVenta IdNotaCreditoVentaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
