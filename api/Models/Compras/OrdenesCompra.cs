using System;
using System.Collections.Generic;
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
    public string Descripcion { get; set; } = null!;

    public virtual ICollection<FacturasCompra> FacturasCompras { get; set; } = new List<FacturasCompra>();

    [ForeignKey("IdEstado")]
    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    [ForeignKey("IdPedidoCotizacion")]
    public virtual PedidosCotizaciones IdPedidoCotizacionNavigation { get; set; } = null!;

    [ForeignKey("IdProveedor")]
    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<OrdenesComprasDetalle> OrdenesComprasDetalles { get; set; } = new List<OrdenesComprasDetalle>();
}