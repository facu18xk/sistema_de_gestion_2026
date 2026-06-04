using System;

namespace api.Dtos.Clientes;

public class ClienteDto
{
    public int IdCliente { get; set; }

    public string Ci { get; set; } = string.Empty;

    public string Ruc { get; set; } = string.Empty;

    public DateOnly FechaNacimiento { get; set; }

    public int IdDireccion { get; set; }

    public DireccionClienteDto? Direccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionClienteDto
{
    public int IdDireccion { get; set; }

    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
    
    public int IdPais { get; set; }
}

public class ClienteUpsertDto
{
    public string Ci { get; set; } = string.Empty;

    public string Ruc { get; set; } = string.Empty;

    public DateOnly FechaNacimiento { get; set; }

    public DireccionClienteUpsertDto Direccion { get; set; } = new();

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionClienteUpsertDto
{
    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
}