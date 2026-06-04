namespace api.Dtos.OrdenesPagosComprasDetalles;

public class OrdenesPagosComprasDetalleDto
{
    public int IdOrdenPagoCompraDetalle { get; set; }
    public int IdOrdenPagoCompra { get; set; }
    public int IdFacturaCompra { get; set; }
    
    public int IdCuentaBancaria { get; set; }
    public string NumeroCuentaBancaria { get; set; } = string.Empty;

    public int IdMedioPagoCompra { get; set; }
    public string MedioPago { get; set; } = string.Empty;

    public decimal Monto { get; set; }
    public FacturaCompraResumenDto? FacturaCompra { get; set; }
}

public class FacturaCompraResumenDto
{
    public int IdFacturaCompra { get; set; }
    public string Nro_Comprobante { get; set; } = string.Empty;
}

public class OrdenesPagosComprasDetalleUpsertDto
{
    public int IdOrdenPagoCompraDetalle { get; set; }
    public int IdOrdenPagoCompra { get; set; }
    public int IdFacturaCompra { get; set; }
    public int IdCuentaBancaria { get; set; }
    public int IdMedioPagoCompra { get; set; }
    public decimal Monto { get; set; }
}