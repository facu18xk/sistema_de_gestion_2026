namespace api.Dtos.FacturasVentas;

public class FacturasVentaDto
{
    public int IdFacturaVenta { get; set; }

    public int IdPresupuesto { get; set; }

    public string PresupuestoDescripcion { get; set; } = string.Empty;

    public int IdCliente { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public string NroComprobante { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public int IdTimbrado { get; set; }

    public string Timbrado { get; set; } = string.Empty;

    public string TimbradoRuc { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }

    public string MedioPagoCompra { get; set; } = string.Empty;

    public DateTime FechaPago { get; set; }
}

public class FacturasVentaUpsertDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public string? NroComprobante { get; set; }

    public int IdEstado { get; set; }

    public int IdTimbrado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }

    public DateTime FechaPago { get; set; }
}
