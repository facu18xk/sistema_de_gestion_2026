using System;

namespace api.Dtos.Parientes;

public class ParienteDto
{
    public int IdPariente { get; set; }
    
    public int IdEmpleado { get; set; }
    
    public string TipoRelacion { get; set; } = string.Empty;
    
    public short Edad { get; set; }
    
    public DateOnly FechaNacimiento { get; set; }

    public EmpleadoParienteDto? Empleado { get; set; }
}

public class EmpleadoParienteDto
{
    public int IdEmpleado { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
}

public class ParienteUpsertDto
{
    public int IdPariente { get; set; }
    
    public int IdEmpleado { get; set; }
    
    public string TipoRelacion { get; set; } = string.Empty;
    
    public short Edad { get; set; }
    
    public DateOnly FechaNacimiento { get; set; }
}