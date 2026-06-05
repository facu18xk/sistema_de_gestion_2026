using api.Dtos.PedidosComprasDetalles;

namespace api.Dtos.PedidosCompras;

public class PedidosCompraDto
{
    public int IdPedidoCompra { get; set; }

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}

public class PedidosCompraUpsertDto
{
    public int IdEstado { get; set; }

    public int NumeroPedido { get; set; }

    public DateTime Fecha { get; set; }
}

public class PedidosCompraCompletoCreateDto : PedidosCompraUpsertDto
{
    public IReadOnlyCollection<PedidosComprasDetalleCompletoCreateDto> Detalles { get; set; } =
        Array.Empty<PedidosComprasDetalleCompletoCreateDto>();
}
