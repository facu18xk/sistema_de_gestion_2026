namespace api.Dtos.Productos;

public class ProductoDto
{
    public int IdProducto { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public decimal PrecioUnitario { get; set; }

    public bool EsServicio { get; set; }

    public decimal PorcentajeIva { get; set; }

    public int CantidadTotal { get; set; }

    public int IdMarca { get; set; }

    public string Marca { get; set; } = string.Empty;

    public int IdCategoria { get; set; }

    public string Categoria { get; set; } = string.Empty;
}

public class ProductoUpsertDto
{
    public string Descripcion { get; set; } = string.Empty;

    public decimal PrecioUnitario { get; set; }

    public bool EsServicio { get; set; }

    public decimal PorcentajeIva { get; set; }

    public int IdMarca { get; set; }

    public int IdCategoria { get; set; }
}
