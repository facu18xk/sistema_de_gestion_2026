using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; // Agregar esto para [Column] y [ForeignKey]

namespace api.Models;

public partial class FacturasCompra
{
    public int IdFacturaCompra { get; set; }

    public int IdOrdenCompra { get; set; }

    public int IdProveedor { get; set; }

    [Column("Id_Estado")]
    public int IdEstado { get; set; }

    public string NroComprobante { get; set; } = null!;

    public string Timbrado { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    [ForeignKey("IdEstado")]
    public virtual Estado IdEstadoNavigation { get; set; } = null!;

    public virtual ICollection<FacturasComprasDetalle> FacturasComprasDetalles { get; set; } = new List<FacturasComprasDetalle>();

    public virtual OrdenesCompra IdOrdenCompraNavigation { get; set; } = null!;

    public virtual Proveedor IdProveedorNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosCompra> NotasCreditosCompras { get; set; } = new List<NotasCreditosCompra>();

    public virtual ICollection<NotasDevolucionesCompra> NotasDevolucionesCompras { get; set; } = new List<NotasDevolucionesCompra>();

    public virtual ICollection<OrdenesPagosComprasDetalle> OrdenesPagosComprasDetalles { get; set; } = new List<OrdenesPagosComprasDetalle>();
}