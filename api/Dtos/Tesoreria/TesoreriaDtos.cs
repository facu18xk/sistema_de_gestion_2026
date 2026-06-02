namespace api.Dtos.Tesoreria;

public class BancoDto
{
    public int IdBanco { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public class BancoUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; } = true;
}

public class TipoCuentaBancariaDto
{
    public int IdTipoCuentaBancaria { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class TipoCuentaBancariaUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}

public class CuentaBancariaDto
{
    public int IdCuentaBancaria { get; set; }
    public int IdBanco { get; set; }
    public string Banco { get; set; } = string.Empty;
    public int IdTipoCuentaBancaria { get; set; }
    public string TipoCuentaBancaria { get; set; } = string.Empty;
    public int? IdCuentaContable { get; set; }
    public string CuentaContable { get; set; } = string.Empty;
    public string NumeroCuenta { get; set; } = string.Empty;
    public string Moneda { get; set; } = string.Empty;
    public decimal Saldo { get; set; }
    public decimal SaldoDisponible { get; set; }
    public bool Activa { get; set; }
}

public class CuentaBancariaUpsertDto
{
    public int IdBanco { get; set; }
    public int IdTipoCuentaBancaria { get; set; }
    public int? IdCuentaContable { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public string Moneda { get; set; } = "PYG";
    public decimal Saldo { get; set; }
    public decimal SaldoDisponible { get; set; }
    public bool Activa { get; set; } = true;
}

public class TipoMovimientoBancarioDto
{
    public int IdTipoMovimientoBancario { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class TipoMovimientoBancarioUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}

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
    public int? IdMovimientoBancario { get; set; }
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
    public int? IdMovimientoBancario { get; set; }
    public string NumeroCheque { get; set; } = string.Empty;
    public string Beneficiario { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
    public string Estado { get; set; } = "Emitido";
}

public class ConciliarChequeDto
{
    public DateTime FechaPago { get; set; } = DateTime.Now;
}

public class TipoDepositoBancarioDto
{
    public int IdTipoDepositoBancario { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class TipoDepositoBancarioUpsertDto
{
    public string Nombre { get; set; } = string.Empty;
}

public class DepositoBancarioDto
{
    public int IdDepositoBancario { get; set; }
    public int IdCuentaBancaria { get; set; }
    public string CuentaBancaria { get; set; } = string.Empty;
    public int IdTipoDepositoBancario { get; set; }
    public string TipoDepositoBancario { get; set; } = string.Empty;
    public int? IdMovimientoBancario { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Monto { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
}

public class DepositoBancarioUpsertDto
{
    public int IdCuentaBancaria { get; set; }
    public int IdTipoDepositoBancario { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
    public string Concepto { get; set; } = string.Empty;
}

public class DetalleDepositoBancarioDto
{
    public int IdDetalleDepositoBancario { get; set; }
    public int IdDepositoBancario { get; set; }
    public decimal Monto { get; set; }
    public string? Descripcion { get; set; }
}

public class DetalleDepositoBancarioUpsertDto
{
    public int IdDepositoBancario { get; set; }
    public decimal Monto { get; set; }
    public string? Descripcion { get; set; }
}

public class ChequeMismoBancoDto
{
    public int IdChequeMismoBanco { get; set; }
    public int IdDepositoBancario { get; set; }
    public string NumeroCheque { get; set; } = string.Empty;
    public string Librador { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public decimal Monto { get; set; }
}

public class ChequeMismoBancoUpsertDto
{
    public int IdDepositoBancario { get; set; }
    public string NumeroCheque { get; set; } = string.Empty;
    public string Librador { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
}

public class ChequeTerceroDto
{
    public int IdChequeTercero { get; set; }
    public int IdDepositoBancario { get; set; }
    public string BancoEmisor { get; set; } = string.Empty;
    public string NumeroCheque { get; set; } = string.Empty;
    public string Librador { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; }
    public decimal Monto { get; set; }
    public string Estado { get; set; } = string.Empty;
}

public class ChequeTerceroUpsertDto
{
    public int IdDepositoBancario { get; set; }
    public string BancoEmisor { get; set; } = string.Empty;
    public string NumeroCheque { get; set; } = string.Empty;
    public string Librador { get; set; } = string.Empty;
    public DateTime FechaEmision { get; set; } = DateTime.Now;
    public decimal Monto { get; set; }
    public string Estado { get; set; } = "Pendiente";
}
