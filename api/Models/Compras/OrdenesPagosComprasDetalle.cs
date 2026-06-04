using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models;

public partial class OrdenesPagosComprasDetalle
{
    public int IdOrdenPagoCompraDetalle { get; set; }

    public int IdOrdenPagoCompra { get; set; }

    public int IdFacturaCompra { get; set; }

    [Column("Id_Cuenta_Bancaria")]
    public int IdCuentaBancaria { get; set; }

    [Column("Id_Medio_Pago_Compra")]
    public int IdMedioPagoCompra { get; set; }

    public decimal Monto { get; set; }

    public virtual FacturasCompra IdFacturaCompraNavigation { get; set; } = null!;

    public virtual OrdenesPagosCompra IdOrdenPagoCompraNavigation { get; set; } = null!;

    [ForeignKey("IdCuentaBancaria")]
    public virtual CuentaBancaria IdCuentaBancariaNavigation { get; set; } = null!;

    [ForeignKey("IdMedioPagoCompra")]
    public virtual MediosPagosCompra IdMedioPagoCompraNavigation { get; set; } = null!;
}