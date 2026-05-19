namespace api.Dtos.PreciosVentas;

public class PrecioVentaDto
{
    public int IdPrecioVenta { get; set; }

    public int IdProducto { get; set; }

    public string Producto { get; set; } = string.Empty;

    public decimal PrecioCompraBase { get; set; }

    public decimal PorcentajeGanancia { get; set; }

    public decimal PrecioVenta { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaDesde { get; set; }

    public DateTime? FechaHasta { get; set; }
}

public class PrecioVentaCreateDto
{
    public int IdProducto { get; set; }

    public decimal PorcentajeGanancia { get; set; }
}

public class PrecioVentaUpdateDto
{
    public decimal PorcentajeGanancia { get; set; }
}
