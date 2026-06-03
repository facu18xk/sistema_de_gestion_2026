using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public partial class OrdenesMediosPagosCompra
{
    public int IdOrdenMedioPagoCompra { get; set; }

    public int IdOrdenPagoCompra { get; set; }

    public int IdMedioPagoCompra { get; set; }

    public decimal Monto { get; set; }

    [NotMapped]
    public int? IdCuentaBancaria { get; set; }

    [NotMapped]
    public string? NumeroCheque { get; set; }

    [NotMapped]
    public string? Beneficiario { get; set; }

    [NotMapped]
    public string? ReferenciaBancaria { get; set; }

    [NotMapped]
    public int? IdMovimientoBancario { get; set; }

    [NotMapped]
    public int? IdChequeEmitido { get; set; }

    public virtual MediosPagosCompra IdMedioPagoCompraNavigation { get; set; } = null!;

    public virtual OrdenesPagosCompra IdOrdenPagoCompraNavigation { get; set; } = null!;
}
