namespace api.Dtos.Paises;

public class PaisDto
{
    public int IdPais { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}

public class PaisUpsertDto
{
    public int IdPais { get; set; } 
    
    public string Nombre { get; set; } = string.Empty;
}