namespace api.Dtos.AsientosDetalles;

public class AsientosDetalleDto
{
    public int IdAsientoDetalle { get; set; }
    public int IdAsiento { get; set; }
    public int NumeroAsiento { get; set; }
    public int IdCuentaContable { get; set; }
    public string CuentaContable { get; set; } = string.Empty;
    public int Item { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string? DescripcionItem { get; set; }
}

public class AsientosDetalleUpsertDto
{
    public int IdAsiento { get; set; }
    public int IdCuentaContable { get; set; }
    public int Item { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public string? DescripcionItem { get; set; }
}
