namespace api.Dtos.Ciudades;

public class CiudadDto
{
    public int IdCiudad { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
    
    public int IdPais { get; set; }
    
    public PaisCiudadDto? Pais { get; set; }
}

public class PaisCiudadDto
{
    public int IdPais { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}

public class CiudadUpsertDto
{

    public int IdCiudad { get; set; } 
    
    public string Nombre { get; set; } = string.Empty;
    
    public int IdPais { get; set; }
}