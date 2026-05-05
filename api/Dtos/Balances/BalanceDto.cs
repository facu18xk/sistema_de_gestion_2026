namespace api.Dtos.Balances;

public class BalanceDto
{
    public int IdBalance { get; set; }
    public string TipoBalance { get; set; } = string.Empty;
    public int IdPeriodoContable { get; set; }
    public string PeriodoContable { get; set; } = string.Empty;
    public DateTime FechaGeneracion { get; set; }
}

public class BalanceUpsertDto
{
    public string TipoBalance { get; set; } = string.Empty;
    public int IdPeriodoContable { get; set; }
    public DateTime FechaGeneracion { get; set; }
}
