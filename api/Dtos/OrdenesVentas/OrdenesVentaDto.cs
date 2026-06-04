namespace api.Dtos.OrdenesVentas;

public class OrdenesVentaDto
{
    public int IdOrdenVenta { get; set; }

    public int IdPresupuesto { get; set; }

    public string PresupuestoDescripcion { get; set; } = string.Empty;

    public int IdCliente { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}

public class OrdenesVentaUpsertDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;
}
