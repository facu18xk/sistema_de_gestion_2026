using System;
using System.Collections.Generic;

namespace api.Models;

public partial class OrdenesPagosCompra
{
    public int IdOrdenPagoCompra { get; set; }

    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesMediosPagosCompra> OrdenesMediosPagosCompras { get; set; } = new List<OrdenesMediosPagosCompra>();

    public virtual ICollection<OrdenesPagosComprasDetalle> OrdenesPagosComprasDetalles { get; set; } = new List<OrdenesPagosComprasDetalle>();
}
