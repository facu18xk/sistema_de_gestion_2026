namespace api.Dtos.ModelosAsientos;

public class ModeloAsientoDto
{
    public int IdModeloAsiento { get; set; }
    public int IdModulo { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public string TipoAsiento { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DetalleResumen { get; set; }
    public bool Activo { get; set; }
}

public class ModeloAsientoUpsertDto
{
    public int IdModulo { get; set; }
    public string TipoAsiento { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DetalleResumen { get; set; }
    public bool Activo { get; set; }
}
