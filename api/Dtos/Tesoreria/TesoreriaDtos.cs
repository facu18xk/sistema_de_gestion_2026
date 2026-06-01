namespace api.Dtos.Tesoreria;

public class MovimientoBancarioDto
{
    public int IdMovimientoBancario { get; set; }
    public int IdCuentaBancaria { get; set; }
    public string CuentaBancaria { get; set; } = string.Empty;
    public int IdTipoMovimientoBancario { get; set; }
    public string TipoMovimientoBancario { get; set; } = string.Empty;
    public int? IdEstado { get; set; }
    public string Estado { get; set; } = string.Empty;
    public int? IdOrdenMedioPagoCompra { get; set; }
    public int? IdChequeEmitido { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public string? Referencia { get; set; }
}

public class MovimientoBancarioUpsertDto
{
    public int IdCuentaBancaria { get; set; }
    public int IdTipoMovimientoBancario { get; set; }
    public int? IdEstado { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public string? Referencia { get; set; }
}

public class ChequeEmitidoDto
{
    public int IdChequeEmitido { get; set; }
    public int IdCuentaBancaria { get; set; }
    public string CuentaBancaria { get; set; } = string.Empty;
    public int? IdOrdenMedioPagoCompra { get; set; }
    public int? IdOrdenCompra { get; set; }
    public string NumeroCheque { get; set; } = string.Empty;
    public string Beneficiario { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public decimal Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
}

public class ChequeEmitidoUpsertDto
{
    public int IdCuentaBancaria { get; set; }
    public int? IdOrdenMedioPagoCompra { get; set; }
    public string NumeroCheque { get; set; } = string.Empty;
    public string Beneficiario { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
    public string Estado { get; set; } = "Emitido";
}
