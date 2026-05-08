using System;

namespace api.Dtos.Empleados;

public class EmpleadoDto
{
    public int IdEmpleado { get; set; }
    
    public int IdPersona { get; set; }
    
    public string Ci { get; set; } = string.Empty;
    
    public string Ruc { get; set; } = string.Empty;
    
    public DateOnly FechaIngreso { get; set; }

    public PersonaEmpleadoDto? Persona { get; set; }
}

public class PersonaEmpleadoDto
{
    public int IdPersona { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
}

public class EmpleadoUpsertDto
{
    public int IdEmpleado { get; set; }
    
    public int IdPersona { get; set; }
    
    public string Ci { get; set; } = string.Empty;
    
    public string Ruc { get; set; } = string.Empty;
    
    public DateOnly FechaIngreso { get; set; }
}