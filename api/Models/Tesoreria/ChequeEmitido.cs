using System;

namespace api.Models;

public partial class ChequeEmitido
{
    public int IdChequeEmitido { get; set; }

    public int IdCuentaBancaria { get; set; }

    public int? IdOrdenMedioPagoCompra { get; set; }

    public int? IdMovimientoBancario { get; set; }

    public string NumeroCheque { get; set; } = null!;

    public string Beneficiario { get; set; } = null!;

    public DateTime FechaEmision { get; set; }

    public DateTime? FechaPago { get; set; }

    public decimal Monto { get; set; }

    public string Estado { get; set; } = "Emitido";

    public virtual CuentaBancaria IdCuentaBancariaNavigation { get; set; } = null!;

    public virtual OrdenesMediosPagosCompra? IdOrdenMedioPagoCompraNavigation { get; set; }

    public virtual MovimientoBancario? IdMovimientoBancarioNavigation { get; set; }
}
