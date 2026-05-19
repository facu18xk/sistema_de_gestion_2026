namespace api.Dtos.CotizacionesComprasDetalles;

public class CotizacionesComprasDetalleDto
{
    public int IdCotizacionCompraDetalle { get; set; }

    public int CotizacionCompraId { get; set; }

    public int ProductoId { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }
}

public class CotizacionesComprasDetalleUpsertDto
{
    public int CotizacionCompraId { get; set; }

    public int ProductoId { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }
}
