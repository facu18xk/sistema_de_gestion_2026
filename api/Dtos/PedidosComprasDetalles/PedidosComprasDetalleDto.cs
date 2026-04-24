namespace api.Dtos.PedidosComprasDetalles;

public class PedidosComprasDetalleDto
{
    public int IdPedidoCompraDetalle { get; set; }

    public int IdPedidoCompra { get; set; }

    public int NumeroPedidoCompra { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int Cantidad { get; set; }
}

public class PedidosComprasDetalleUpsertDto
{
    public int IdPedidoCompra { get; set; }

    public int IdProducto { get; set; }

    public string Categoria { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int Cantidad { get; set; }
}
