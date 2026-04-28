namespace api.Dtos.ProductosProveedores;

public class ProductoProveedorDto
{
    public int ProductoId { get; set; }

    public string Producto { get; set; } = string.Empty;

    public int ProveedorId { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public string CodigoProveedor { get; set; } = string.Empty;

    public bool Activo { get; set; }
}

public class ProductoProveedorUpsertDto
{
    public int ProductoId { get; set; }

    public int ProveedorId { get; set; }

    public string CodigoProveedor { get; set; } = string.Empty;

    public bool Activo { get; set; }
}
