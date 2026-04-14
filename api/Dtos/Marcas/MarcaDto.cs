namespace api.Dtos.Marcas;

public class MarcaDto
{
    public int IdMarca { get; set; }

    public string Nombre { get; set; } = string.Empty;
}

public class MarcaUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}
