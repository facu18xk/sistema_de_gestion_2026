namespace api.Dtos.Estados;

public class EstadoDto
{
    public int IdEstado { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}

public class EstadoUpsertDto
{
    public int IdEstado { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}