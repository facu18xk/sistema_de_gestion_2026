using System;
using System.Collections.Generic;

namespace api.Models;

public partial class CotizacionesCompra
{
    public int IdCotizacionCompra { get; set; }

    public int SolicitudCotizacionId { get; set; }

    public int ProveedorId { get; set; }

    public DateTime Fecha { get; set; }

    public DateTime ValidaHasta { get; set; }

    public int IdEstado { get; set; }

    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual Proveedor Proveedor { get; set; } = null!;

    public virtual PedidosCotizaciones SolicitudCotizacion { get; set; } = null!;

    public virtual ICollection<CotizacionesComprasDetalle> CotizacionesComprasDetalles { get; set; } = new List<CotizacionesComprasDetalle>();

    public virtual ICollection<OrdenesCompra> OrdenesCompras { get; set; } = new List<OrdenesCompra>();
}
