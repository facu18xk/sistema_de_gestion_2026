namespace api.Dtos.ModelosAsientosDetalles;

public class ModelosAsientosDetalleDto
{
    public int IdModeloAsientoDetalle { get; set; }
    public int IdModeloAsiento { get; set; }
    public string ModeloAsiento { get; set; } = string.Empty;
    public int IdCuentaContable { get; set; }
    public string CuentaContable { get; set; } = string.Empty;
    public int Item { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? DescripcionItem { get; set; }
}

public class ModelosAsientosDetalleUpsertDto
{
    public int IdModeloAsiento { get; set; }
    public int IdCuentaContable { get; set; }
    public int Item { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? DescripcionItem { get; set; }
}
