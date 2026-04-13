using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class NotasCreditosCompra
{
    public int IdNotaCreditoCompra { get; set; }

    public int IdFacturaCompra { get; set; }

    public int IdNotaDevolucionCompra { get; set; }

    public string Timbrado { get; set; } = null!;

    public string Motivo { get; set; } = null!;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }

    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual NotasDevolucionesCompra IdNotaDevolucionCompraNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosComprasDetalle> NotasCreditosComprasDetalles { get; set; } = new List<NotasCreditosComprasDetalle>();
}
