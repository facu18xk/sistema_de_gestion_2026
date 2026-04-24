namespace api.Dtos.MediosPagosCompras;

public class MediosPagosCompraDto
{
    public int IdMedioPagoCompra { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}

public class MediosPagosCompraUpsertDto
{
    public int IdMedioPagoCompra { get; set; }
    
    public string Nombre { get; set; } = string.Empty;
}