namespace api.Dtos.CotizacionesCompras;

public class CotizacionesCompraDto
{
    public int IdCotizacionCompra { get; set; }

    public int SolicitudCotizacionId { get; set; }

    public int NumeroSolicitudCotizacion { get; set; }

    public int ProveedorId { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public DateTime ValidaHasta { get; set; }

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;
}

public class CotizacionesCompraUpsertDto
{
    public int SolicitudCotizacionId { get; set; }

    public int ProveedorId { get; set; }

    public DateTime Fecha { get; set; }

    public DateTime ValidaHasta { get; set; }

    public int IdEstado { get; set; }
}
