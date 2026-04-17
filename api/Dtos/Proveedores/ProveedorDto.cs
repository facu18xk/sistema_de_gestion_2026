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

    public CiudadProveedorDto? Ciudad { get; set; }
}

public class CiudadProveedorDto
{
    public int IdCiudad { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public int IdPais { get; set; }

    public PaisProveedorDto? Pais { get; set; }
}

public class PaisProveedorDto
{
    public int IdPais { get; set; }

    public string Nombre { get; set; } = string.Empty;
}

public class ProveedorUpsertDto
{
    public string Ruc { get; set; } = string.Empty;

    public string RazonSocial { get; set; } = string.Empty;

    public string NombreFantasia { get; set; } = string.Empty;

    public int IdDireccion { get; set; }

    public DireccionProveedorUpsertDto? Direccion { get; set; }

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;
}

public class DireccionProveedorUpsertDto
{
    public int IdDireccion { get; set; }

    public string Calle1 { get; set; } = string.Empty;

    public string Calle2 { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;

    public int IdCiudad { get; set; }
}
