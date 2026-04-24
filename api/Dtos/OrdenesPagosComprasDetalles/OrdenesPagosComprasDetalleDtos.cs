namespace api.Dtos.OrdenesPagosComprasDetalles;

public class OrdenesPagosComprasDetalleDto
{
    public int IdOrdenPagoCompraDetalle { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdFacturaCompra { get; set; }
    
    public decimal Monto { get; set; }
    public FacturaCompraResumenDto? FacturaCompra { get; set; }
}

public class FacturaCompraResumenDto
{
    public int IdFacturaCompra { get; set; }
    public string NumeroFactura { get; set; } = string.Empty;
}

public class OrdenesPagosComprasDetalleUpsertDto
{
    public int IdOrdenPagoCompraDetalle { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdFacturaCompra { get; set; }
    
    public decimal Monto { get; set; }
}