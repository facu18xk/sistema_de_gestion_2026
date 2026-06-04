using System.Collections.Generic;

namespace api.Models;

public partial class CuentaBancaria
{
    public int IdCuentaBancaria { get; set; }

    public int IdBanco { get; set; }

    public int IdTipoCuentaBancaria { get; set; }

    public int? IdCuentaContable { get; set; }

    public string NumeroCuenta { get; set; } = null!;

    public string Moneda { get; set; } = "PYG";

    public decimal Saldo { get; set; }

    public decimal SaldoDisponible { get; set; }

    public bool Activa { get; set; } = true;

    public virtual Banco IdBancoNavigation { get; set; } = null!;

    public virtual TipoCuentaBancaria IdTipoCuentaBancariaNavigation { get; set; } = null!;

    public virtual CuentaContable? IdCuentaContableNavigation { get; set; }

    public virtual ICollection<MovimientoBancario> MovimientosBancarios { get; set; } = new List<MovimientoBancario>();

    public virtual ICollection<ChequeEmitido> ChequesEmitidos { get; set; } = new List<ChequeEmitido>();

    public virtual ICollection<DepositoBancario> DepositosBancarios { get; set; } = new List<DepositoBancario>();
}
