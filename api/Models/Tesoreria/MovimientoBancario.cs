using System;

namespace api.Models;

public partial class MovimientoBancario
{
    public int IdMovimientoBancario { get; set; }

    public int IdCuentaBancaria { get; set; }

    public int IdTipoMovimientoBancario { get; set; }

    public int? IdEstado { get; set; }

    public int? IdOrdenMedioPagoCompra { get; set; }

    public int? IdChequeEmitido { get; set; }

    public DateTime Fecha { get; set; }

    public decimal Monto { get; set; }

    public string Concepto { get; set; } = null!;

    public string? Referencia { get; set; }

    public virtual CuentaBancaria IdCuentaBancariaNavigation { get; set; } = null!;

    public virtual TipoMovimientoBancario IdTipoMovimientoBancarioNavigation { get; set; } = null!;

    public virtual Estado? IdEstadoNavigation { get; set; }

    public virtual OrdenesMediosPagosCompra? IdOrdenMedioPagoCompraNavigation { get; set; }

    public virtual ChequeEmitido? IdChequeEmitidoNavigation { get; set; }
}
