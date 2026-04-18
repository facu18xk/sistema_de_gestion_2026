namespace api.Dtos.OrdenesPagosCompras;

public class OrdenesPagosCompraDto
{
    public int IdOrdenPagoCompra { get; set; }

    public int IdProveedor { get; set; }

    public string Proveedor { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class OrdenesPagosCompraUpsertDto
{
    public int IdProveedor { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
