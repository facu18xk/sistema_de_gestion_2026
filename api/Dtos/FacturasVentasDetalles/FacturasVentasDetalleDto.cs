namespace api.Dtos.FacturasVentasDetalles;

public class FacturasVentasDetalleDto
{
    public int IdFacturaVentaDetalle { get; set; }

    public int IdFacturaVenta { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int Cantidad { get; set; }

    public int CantidadDevuelta { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal TotalBruto { get; set; }

    public decimal TotalIva { get; set; }

    public decimal TotalNeto { get; set; }
}

public class FacturasVentasDetalleUpsertDto
{
    public int IdFacturaVenta { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal TotalBruto { get; set; }

    public decimal TotalIva { get; set; }

    public decimal TotalNeto { get; set; }
}
