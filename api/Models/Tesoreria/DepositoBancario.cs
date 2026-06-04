using System;
using System.Collections.Generic;

namespace api.Models;

public partial class DepositoBancario
{
    public int IdDepositoBancario { get; set; }

    public int IdCuentaBancaria { get; set; }

    public int IdTipoDepositoBancario { get; set; }

    public int? IdMovimientoBancario { get; set; }

    public DateTime Fecha { get; set; }

    public decimal Monto { get; set; }

    public string Concepto { get; set; } = null!;

    public string Estado { get; set; } = "Registrado";

    public virtual CuentaBancaria IdCuentaBancariaNavigation { get; set; } = null!;

    public virtual TipoDepositoBancario IdTipoDepositoBancarioNavigation { get; set; } = null!;

    public virtual MovimientoBancario? IdMovimientoBancarioNavigation { get; set; }

    public virtual ICollection<DetalleDepositoBancario> DetallesDepositosBancarios { get; set; } = new List<DetalleDepositoBancario>();

    public virtual ICollection<ChequeMismoBanco> ChequesMismoBanco { get; set; } = new List<ChequeMismoBanco>();

    public virtual ICollection<ChequeTercero> ChequesTerceros { get; set; } = new List<ChequeTercero>();
}
