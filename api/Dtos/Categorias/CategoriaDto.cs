namespace api.Dtos.Categorias;

public class CategoriaDto
{
    public int IdCategoria { get; set; }

    public string Nombre { get; set; } = string.Empty;
}

public class CategoriaUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}
