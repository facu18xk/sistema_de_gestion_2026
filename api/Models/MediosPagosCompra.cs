using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class MediosPagosCompra
{
    public int IdMedioPagoCompra { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual ICollection<OrdenesMediosPagosCompra> OrdenesMediosPagosCompras { get; set; } = new List<OrdenesMediosPagosCompra>();
}
