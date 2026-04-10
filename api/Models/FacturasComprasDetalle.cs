using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class FacturasComprasDetalle
{
    public int IdFacturaCompraDetalle { get; set; }

    public int IdFacturaCompra { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal TotalBruto { get; set; }

    public decimal TotalIva { get; set; }

    public decimal TotalNeto { get; set; }

    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual Producto IdProductoNavigation { get; set; } = null!;
}
