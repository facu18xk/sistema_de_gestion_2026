using System;
using System.Collections.Generic;

namespace api.Models;

public partial class NotasDevolucionesCompra
{
    public int IdNotaDevolucionCompra { get; set; }

    public int IdFacturaCompra { get; set; }

    public string Motivo { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosCompra> NotasCreditosCompras { get; set; } = new List<NotasCreditosCompra>();

    public virtual ICollection<NotasDevolucionesComprasDetalle> NotasDevolucionesComprasDetalles { get; set; } = new List<NotasDevolucionesComprasDetalle>();
}
