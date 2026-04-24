namespace api.Dtos.Proveedores;

public class ProveedorDto
{
    public int IdProveedor { get; set; }

    public string Ruc { get; set; } = string.Empty;

    public string RazonSocial { get; set; } = string.Empty;

    public string NombreFantasia { get; set; } = string.Empty;

    public int IdDireccion { get; set; }

    public DireccionProveedorDto? Direccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionProveedorDto
{
    public int IdDireccion { get; set; }

    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
    public int IdPais { get; set; }
}

public class ProveedorUpsertDto
{
    public string Ruc { get; set; } = string.Empty;

    public string RazonSocial { get; set; } = string.Empty;

    public string NombreFantasia { get; set; } = string.Empty;

    public DireccionProveedorUpsertDto Direccion { get; set; } = new();

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionProveedorUpsertDto
{
    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
}
