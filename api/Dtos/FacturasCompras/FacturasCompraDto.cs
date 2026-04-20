namespace api.Dtos.FacturasCompras;

public class FacturasCompraDto
{
    public int IdFacturaCompra { get; set; }

    public int IdOrdenCompra { get; set; }

    public string OrdenCompraDescripcion { get; set; } = string.Empty;

    public int IdProveedor { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public string NroComprobante { get; set; } = string.Empty;

    public string Timbrado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class FacturasCompraUpsertDto
{
    public int IdOrdenCompra { get; set; }

    public int IdProveedor { get; set; }

    public string NroComprobante { get; set; } = string.Empty;

    public string Timbrado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
