namespace api.Dtos.PedidosCotizacionesDetalles;

public class PedidosCotizacionesDetalleDto
{
    public int IdPedidoCotizacionDetalle { get; set; }

    public int IdPedidoCotizacion { get; set; }

    public int NumeroPedidoCotizacion { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioProducto { get; set; }
}

public class PedidosCotizacionesDetalleUpsertDto
{
    public int IdPedidoCotizacion { get; set; }

    public int IdProducto { get; set; }

    public string Categoria { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioProducto { get; set; }
}
