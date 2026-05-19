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
    public int IdDireccion { get; set; }

    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }

    public int IdPais { get; set; }
}

public class EmpleadoUpsertDto
{
    public DireccionEmpleadoUpsertDto Direccion { get; set; } = new();

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
    
    public string Ci { get; set; } = string.Empty;

    public string Ruc { get; set; } = string.Empty;

    public DateOnly FechaIngreso { get; set; }
}

public class DireccionEmpleadoUpsertDto
{
    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
}
