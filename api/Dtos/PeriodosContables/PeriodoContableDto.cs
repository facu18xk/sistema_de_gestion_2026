namespace api.Dtos.PeriodosContables;

public class PeriodoContableDto
{
    public int IdPeriodoContable { get; set; }
    public int IdProcesoContable { get; set; }
    public string ProcesoContable { get; set; } = string.Empty;
    public int Anho { get; set; }
    public int Mes { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public string Estado { get; set; } = string.Empty;
}

public class PeriodoContableUpsertDto
{
    public int IdProcesoContable { get; set; }
    public int Anho { get; set; }
    public int Mes { get; set; }
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }
    public string Estado { get; set; } = string.Empty;
}
