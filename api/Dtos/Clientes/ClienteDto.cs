using System;

namespace api.Dtos.Clientes;

public class ClienteDto
{
    public int IdCliente { get; set; }
    
    public int IdPersona { get; set; }
    
    public string Ci { get; set; } = string.Empty;
    
    public string Ruc { get; set; } = string.Empty;
    
    public DateOnly FechaNacimiento { get; set; }

    public PersonaClienteDto? Persona { get; set; }
}

public class PersonaClienteDto
{
    public int IdPersona { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
}

public class ClienteUpsertDto
{
    public int IdCliente { get; set; }
    
    public int IdPersona { get; set; }
    
    public string Ci { get; set; } = string.Empty;
    
    public string Ruc { get; set; } = string.Empty;
    
    public DateOnly FechaNacimiento { get; set; }
}