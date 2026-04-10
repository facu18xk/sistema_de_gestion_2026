using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class NotasDevolucionesVenta
{
    public int IdNotaDevolucionVenta { get; set; }

    public int IdFacturaVenta { get; set; }

    public string Motivo { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public virtual FacturasVenta IdFacturaVentaNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosVenta> NotasCreditosVenta { get; set; } = new List<NotasCreditosVenta>();

    public virtual ICollection<NotasDevolucionesVentasDetalle> NotasDevolucionesVentasDetalles { get; set; } = new List<NotasDevolucionesVentasDetalle>();
}
