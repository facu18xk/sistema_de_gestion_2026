namespace api.Dtos.NotasCreditosVentas;

using api.Dtos.NotasCreditosVentasDetalles;

public class NotasCreditosVentaDto
{
    public int IdNotaCreditoVenta { get; set; }

    public int IdFacturaVenta { get; set; }

    public string FacturaVenta { get; set; } = string.Empty;

    public int? IdNotaDevolucionVenta { get; set; }

    public string NotaDevolucionVenta { get; set; } = string.Empty;

    public int IdTimbrado { get; set; }

    public string Timbrado { get; set; } = string.Empty;

    public string Motivo { get; set; } = string.Empty;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }

    public IReadOnlyCollection<NotasCreditosVentasDetalleDto> Detalles { get; set; } = Array.Empty<NotasCreditosVentasDetalleDto>();
}

public class NotasCreditosVentaUpsertDto
{
    public int IdFacturaVenta { get; set; }

    public int? IdNotaDevolucionVenta { get; set; }

    public int IdTimbrado { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public DateTime FechaEmision { get; set; }

    public decimal Total { get; set; }
}
