namespace api.Dtos.Asientos;

public class AsientoDto
{
    public int IdAsiento { get; set; }
    public int NumeroAsiento { get; set; }
    public int IdPeriodoContable { get; set; }
    public string PeriodoContable { get; set; } = string.Empty;
    public int? IdModulo { get; set; }
    public string Modulo { get; set; } = string.Empty;
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public bool Automatico { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? ReferenciaOrigen { get; set; }
    public int? IdOrigen { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? FechaMayorizacion { get; set; }
}

public class AsientoUpsertDto
{
    public int? IdModulo { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public bool Automatico { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string? ReferenciaOrigen { get; set; }
    public int? IdOrigen { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? FechaMayorizacion { get; set; }
}
