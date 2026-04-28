namespace api.Dtos.CategoriasProveedores;

public class CategoriaProveedorDto
{
    public int ProveedorId { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public int CategoriaId { get; set; }

    public string Categoria { get; set; } = string.Empty;
}

public class CategoriaProveedorUpsertDto
{
    public int ProveedorId { get; set; }

    public int CategoriaId { get; set; }
}
