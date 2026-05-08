using System;
using System.Collections.Generic;

namespace api.Models;

public partial class FacturasVentasDetalle
{
    public int IdFacturaVentaDetalle { get; set; }

    public int IdFacturaVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal TotalBruto { get; set; }

    public decimal TotalIva { get; set; }

    public decimal TotalNeto { get; set; }

    public virtual FacturasVenta IdFacturaVentaNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
