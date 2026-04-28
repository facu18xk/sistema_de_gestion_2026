using System;
using System.Collections.Generic;

namespace api.Models;

public partial class CotizacionesComprasDetalle
{
    public int IdCotizacionCompraDetalle { get; set; }

    public int CotizacionCompraId { get; set; }

    public int ProductoId { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }

    public virtual CotizacionesCompra CotizacionCompra { get; set; } = null!;

    public virtual Producto Producto { get; set; } = null!;
}
