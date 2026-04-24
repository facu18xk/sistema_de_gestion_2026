namespace api.Dtos.OrdenesMediosPagosCompras;

public class OrdenesMediosPagosCompraDto
{
    public int IdOrdenMedioPagoCompra { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdMedioPagoCompra { get; set; }
    
    public decimal Monto { get; set; }

    public MedioPagoResumenDto? MedioPago { get; set; }
}

public class MedioPagoResumenDto
{
    public int IdMedioPagoCompra { get; set; }
    public string Nombre { get; set; } = string.Empty;
}

public class OrdenesMediosPagosCompraUpsertDto
{
    public int IdOrdenMedioPagoCompra { get; set; }
    
    public int IdOrdenPagoCompra { get; set; }
    
    public int IdMedioPagoCompra { get; set; }
    
    public decimal Monto { get; set; }
}