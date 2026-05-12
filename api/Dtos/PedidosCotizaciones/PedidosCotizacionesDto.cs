namespace api.Dtos.PedidosCotizaciones;

public class PedidosCotizacionesDto
{
    public int IdPedidoCotizacion { get; set; }

    public int IdPedidoCompra { get; set; }

    public int NumeroPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public int IdProveedor { get; set; }

    public ProveedorPedidoCotizacionDto? Proveedor { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}
public class ProveedorPedidoCotizacionDto
{
    public int IdProveedor { get; set; }
    public string Ruc { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
}
public class PedidosCotizacionesUpsertDto
{
    public int IdPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public int IdProveedor { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}
