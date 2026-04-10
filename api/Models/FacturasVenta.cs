using System;
using System.Collections.Generic;

namespace DatabaseHastaCompraVenta.Models;

public partial class FacturasVenta
{
    public int IdFacturaVenta { get; set; }

    public int IdOrdenVenta { get; set; }

    public int IdCliente { get; set; }

    public string NroComprobante { get; set; } = null!;

    public int IdTimbrado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = null!;

    public int IdMedioPagoCompra { get; set; }

    public DateTime FechaPago { get; set; }

    public virtual ICollection<FacturasVentasDetalle> FacturasVentasDetalles { get; set; } = new List<FacturasVentasDetalle>();

    public virtual Cliente IdClienteNavigation { get; set; } = null!;

    public virtual MediosPagosCompra IdMedioPagoCompraNavigation { get; set; } = null!;

    public virtual OrdenesVenta IdOrdenVentaNavigation { get; set; } = null!;

    public virtual Timbrado IdTimbradoNavigation { get; set; } = null!;

    public virtual ICollection<NotasCreditosVenta> NotasCreditosVenta { get; set; } = new List<NotasCreditosVenta>();

    public virtual ICollection<NotasDevolucionesVenta> NotasDevolucionesVenta { get; set; } = new List<NotasDevolucionesVenta>();
}
