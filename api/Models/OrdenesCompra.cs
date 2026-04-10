using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class OrdenesCompra
{
    public int IdOrdenCompra { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<FacturasCompra> FacturasCompras { get; set; } = new List<FacturasCompra>();

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual PedidosCotizacione IdPedidoCotizacionNavigation { get; set; } = null!;

    public virtual Proveedore IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; } = new List<OrdenesComprasDetalle>();
}
