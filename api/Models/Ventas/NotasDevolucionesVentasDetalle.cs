using System;
using System.Collections.Generic;

namespace api.Models;

public partial class NotasDevolucionesVentasDetalle
{
    public int IdNotaDevolucionVentaDetalle { get; set; }

    public int IdNotaDevolucionVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }

    public virtual NotasDevolucionesVenta IdNotaDevolucionVentaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
