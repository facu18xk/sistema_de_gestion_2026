using System;
using System.Collections.Generic;

namespace api.Models;

public partial class NotasDevolucionesComprasDetalle
{
    public int IdNotaDevolucionCompraDetalle { get; set; }

    public int IdNotaDevolucionCompra { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    public virtual NotasDevolucionesCompra IdNotaDevolucionCompraNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
