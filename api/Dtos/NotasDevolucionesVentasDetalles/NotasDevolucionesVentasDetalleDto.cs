namespace api.Dtos.NotasDevolucionesVentasDetalles;

public class NotasDevolucionesVentasDetalleDto
{
    public int IdNotaDevolucionVentaDetalle { get; set; }

    public int IdNotaDevolucionVenta { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}

public class NotasDevolucionesVentasDetalleUpsertDto
{
    public int IdNotaDevolucionVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}
