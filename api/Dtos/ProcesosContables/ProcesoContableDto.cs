namespace api.Dtos.ProcesosContables;

public class ProcesoContableDto
{
    public int IdProcesoContable { get; set; }
    public int PeriodoAnho { get; set; }
    public string? Descripcion { get; set; }
    public int? CantNiveles { get; set; }
    public int? CantDigitosNivel { get; set; }
    public string? Moneda { get; set; }
    public string? Estado { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class ProcesoContableUpsertDto
{
    public int PeriodoAnho { get; set; }
    public string? Descripcion { get; set; }
    public int? CantNiveles { get; set; }
    public int? CantDigitosNivel { get; set; }
    public string? Moneda { get; set; }
    public string? Estado { get; set; }
    public DateTime? CreatedAt { get; set; }
}
