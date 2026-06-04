namespace api.Dtos.Modulos;

public class ModuloDto
{
    public int IdModulo { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class ModuloUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}
