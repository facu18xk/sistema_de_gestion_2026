namespace api.Dtos.CuentasContables;

public class CuentaContableDto
{
    public int IdCuentaContable { get; set; }
    public int IdProcesoContable { get; set; }
    public string ProcesoContable { get; set; } = string.Empty;
    public int? IdCuentaPadre { get; set; }
    public string CuentaPadre { get; set; } = string.Empty;
    public string NumeroCuenta { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public bool EsAsentable { get; set; }
    public bool Activa { get; set; }
}

public class CuentaContableUpsertDto
{
    public int IdProcesoContable { get; set; }
    public int? IdCuentaPadre { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string TipoCuenta { get; set; } = string.Empty;
    public bool EsAsentable { get; set; }
    public bool Activa { get; set; }
}
