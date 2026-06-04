namespace api.Dtos.NotasDevolucionesVentas;

public class NotasDevolucionesVentaDto
{
    public int IdNotaDevolucionVenta { get; set; }

    public int IdFacturaVenta { get; set; }

    public string FacturaVenta { get; set; } = string.Empty;

    public string Motivo { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }
}

public class NotasDevolucionesVentaUpsertDto
{
    public int IdFacturaVenta { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }
}
