using System;

namespace api.Dtos.Empleados;

public class EmpleadoDto
{
    public int IdEmpleado { get; set; }

    public string Ci { get; set; } = string.Empty;

    public string Ruc { get; set; } = string.Empty;

    public DateOnly FechaIngreso { get; set; }

    public int IdDireccion { get; set; }

    public DireccionEmpleadoDto? Direccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionEmpleadoDto
{
    public int IdPersona { get; set; }
    public int IdDireccion { get; set; }
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
}

public class EmpleadoUpsertDto
{
    public int IdDireccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
    
    public string Ci { get; set; } = string.Empty;

    public string Ruc { get; set; } = string.Empty;

    public DateOnly FechaIngreso { get; set; }
}
