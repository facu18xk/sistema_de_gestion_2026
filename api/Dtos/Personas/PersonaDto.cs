namespace api.Dtos.Personas;

public class PersonaDto
{
    public int IdPersona { get; set; }
    
    public int IdDireccion { get; set; }
    
    public string Nombres { get; set; } = string.Empty;
    
    public string Apellidos { get; set; } = string.Empty;
    
    public string Correo { get; set; } = string.Empty;
    
    public string Telefono { get; set; } = string.Empty;

    public DireccionPersonaDto? Direccion { get; set; }
}

public class DireccionPersonaDto
{
    public int IdDireccion { get; set; }
    public string Calle1 { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
}

public class PersonaUpsertDto
{
    public int IdPersona { get; set; }
    
    public int IdDireccion { get; set; }
    
    public string Nombres { get; set; } = string.Empty;
    
    public string Apellidos { get; set; } = string.Empty;
    
    public string Correo { get; set; } = string.Empty;
    
    public string Telefono { get; set; } = string.Empty;
}