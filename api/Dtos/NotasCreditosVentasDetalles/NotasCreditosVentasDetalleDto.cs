namespace api.Dtos.NotasCreditosVentasDetalles;

public class NotasCreditosVentasDetalleDto
{
    public int IdNotaCreditoVentaDetalle { get; set; }

    public int IdNotaCreditoVenta { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}

public class NotasCreditosVentasDetalleUpsertDto
{
    public int IdNotaCreditoVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Subtotal { get; set; }
}
