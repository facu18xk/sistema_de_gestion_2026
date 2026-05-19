namespace api.Dtos.Direcciones;

public class DireccionDto
{
    public int IdDireccion { get; set; }
    
    public string Calle1 { get; set; } = string.Empty;
    
    public string Calle2 { get; set; } = string.Empty;
    
    public string Descripcion { get; set; } = string.Empty;
    
    public int IdCiudad { get; set; }
    
    public CiudadDireccionDto? Ciudad { get; set; }
}

public class CiudadDireccionDto
{
    public int IdCiudad { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}

public class DireccionUpsertDto
{
    public int IdDireccion { get; set; }
    
    public string Calle1 { get; set; } = string.Empty;
    
    public string Calle2 { get; set; } = string.Empty;
    
    public string Descripcion { get; set; } = string.Empty;
    
    public int IdCiudad { get; set; }
}