using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class OrdenesPagosComprasDetalle
{
    public int IdOrdenPagoCompraDetalle { get; set; }

    public int IdOrdenPagoCompra { get; set; }

    public int IdFacturaCompra { get; set; }

    public decimal Monto { get; set; }

    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual OrdenesPagosCompra IdOrdenPagoCompraNavigation { get; set; } = null!;
}
