namespace api.Dtos.OrdenesVentasDetalles;

public class OrdenesVentasDetalleDto
{
    public int IdOrdenVentaDetalle { get; set; }

    public int IdOrdenVenta { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }
}

public class OrdenesVentasDetalleUpsertDto
{
    public int IdOrdenVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }
}
