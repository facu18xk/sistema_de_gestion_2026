namespace api.Dtos.Presupuestos;

public class PresupuestoDto
{
    public int IdPresupuesto { get; set; }

    public int IdCliente { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public int IdEstado { get; set; }

    public string Estado { get; set; } = string.Empty;

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public DateTime FechaVencimiento { get; set; }
}

public class PresupuestoUpsertDto
{
    public int IdCliente { get; set; }

    public int IdEstado { get; set; }

    public DateTime Fecha { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public DateTime FechaVencimiento { get; set; }
}
