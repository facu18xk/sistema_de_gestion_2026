using System;
using System.Collections.Generic;

namespace api.Models;

public partial class NotasCreditosVenta
{
    public int IdNotaCreditoVenta { get; set; }

    public int IdFacturaVenta { get; set; }

    public int IdNotaDevolucionVenta { get; set; }

    public int IdTimbrado { get; set; }

    public string Motivo { get; set; } = null!;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }

    public virtual FacturasVenta IdFacturaVentaNavigation { get; set; } = null!;

    public virtual NotasDevolucionesVenta IdNotaDevolucionVentaNavigation { get; set; } = null!;

    public virtual Timbrado IdTimbradoNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosVentasDetalle> NotasCreditosVentasDetalles { get; set; } = new List<NotasCreditosVentasDetalle>();
}
