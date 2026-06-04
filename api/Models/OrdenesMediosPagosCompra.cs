using System;
using System.Collections.Generic;

namespace api.Models;

public partial class OrdenesMediosPagosCompra
{
    public int IdOrdenMedioPagoCompra { get; set; }

    public int IdOrdenPagoCompra { get; set; }

    public int IdMedioPagoCompra { get; set; }

    public decimal Monto { get; set; }

    public virtual MediosPagosCompra IdMedioPagoCompraNavigation { get; set; } = null!;

    public virtual OrdenesPagosCompra IdOrdenPagoCompraNavigation { get; set; } = null!;
}
