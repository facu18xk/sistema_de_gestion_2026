namespace api.Dtos.Depositos;

public class DepositoDto
{
    public int IdDepsito { get; set; }

    public string Nombre { get; set; } = string.Empty;
}

public class DepositoUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}
