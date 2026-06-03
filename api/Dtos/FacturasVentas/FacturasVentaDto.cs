namespace api.Dtos.FacturasVentas;

public class FacturasVentaDto
{
    public int IdFacturaVenta { get; set; }

<<<<<<< HEAD
    public int IdPresupuesto { get; set; }

    public string PresupuestoDescripcion { get; set; } = string.Empty;
=======
    public int IdOrdenVenta { get; set; }

    public string OrdenVentaDescripcion { get; set; } = string.Empty;
>>>>>>> front

    public int IdCliente { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public string NroComprobante { get; set; } = string.Empty;

    public int IdTimbrado { get; set; }

<<<<<<< HEAD
    public string Timbrado { get; set; } = string.Empty;

    public string TimbradoRuc { get; set; } = string.Empty;

=======
>>>>>>> front
    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }

    public string MedioPagoCompra { get; set; } = string.Empty;

    public DateTime FechaPago { get; set; }
}

public class FacturasVentaUpsertDto
{
<<<<<<< HEAD
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

=======
    public int IdOrdenVenta { get; set; }

    public int IdCliente { get; set; }

    public string NroComprobante { get; set; } = string.Empty;

    public int IdTimbrado { get; set; }

>>>>>>> front
    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }

    public DateTime FechaPago { get; set; }
}
