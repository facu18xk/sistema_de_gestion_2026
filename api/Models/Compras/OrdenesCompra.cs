using System;
using System.Collections.Generic;
<<<<<<< HEAD
using System.ComponentModel.DataAnnotations.Schema;
namespace api.Models;

[Table("Ordenes_Compras")]
public partial class OrdenesCompra
{
    [Column("Id_Orden_Compra")]
    public int IdOrdenCompra { get; set; }

    [Column("Id_Pedido_Cotizacion")]
    public int IdPedidoCotizacion { get; set; }

    [Column("Id_Proveedor")]
    public int IdProveedor { get; set; }

    [Column("Id_Estado")]
    public int IdEstado { get; set; }

    [Column("Fecha")]
    public DateTime Fecha { get; set; }

    [Column("Descripcion")]
=======

namespace api.Models;

public partial class OrdenesCompra
{
    public int IdOrdenCompra { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int? IdCotizacionCompra { get; set; }

    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

>>>>>>> front
    public string Descripcion { get; set; } = null!;

    public virtual ICollection<FacturasCompra> FacturasCompras { get; set; } = new List<FacturasCompra>();

<<<<<<< HEAD
    [ForeignKey("IdEstado")]
    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    [ForeignKey("IdPedidoCotizacion")]
    public virtual PedidosCotizaciones IdPedidoCotizacionNavigation { get; set; } = null!;

    [ForeignKey("IdProveedor")]
    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; } = new List<OrdenesComprasDetalle>();
}
=======
    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual PedidosCotizaciones IdPedidoCotizacionNavigation { get; set; } = null!;

    public virtual CotizacionesCompra? IdCotizacionCompraNavigation { get; set; }

    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; } = new List<OrdenesComprasDetalle>();
}
>>>>>>> front
