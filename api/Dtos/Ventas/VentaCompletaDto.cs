namespace api.Dtos.Ventas;

public class VentaItemCreateDto
{
    public int IdProducto { get; set; }

    public int Cantidad { get; set; }
}

public class PresupuestoCompletoCreateDto
{
    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public DateTime FechaVencimiento { get; set; }

    public IReadOnlyCollection<VentaItemCreateDto> Items { get; set; } = Array.Empty<VentaItemCreateDto>();
}

public class VentaItemDto
{
    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal PrecioVenta { get; set; }

    public decimal Iva { get; set; }

    public decimal Subtotal { get; set; }
}

public class PresupuestoCompletoDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public DateTime FechaVencimiento { get; set; }

    public IReadOnlyCollection<VentaItemDto> Items { get; set; } = Array.Empty<VentaItemDto>();
}

public class OrdenVentaCompletaCreateDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public IReadOnlyCollection<VentaItemCreateDto> Items { get; set; } = Array.Empty<VentaItemCreateDto>();
}

public class FacturaVentaCompletaCreateDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public string NroComprobante { get; set; } = string.Empty;

    public int IdTimbrado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }

    public DateTime FechaPago { get; set; }

    public IReadOnlyCollection<VentaItemCreateDto> Items { get; set; } = Array.Empty<VentaItemCreateDto>();
}
