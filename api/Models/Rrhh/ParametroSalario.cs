namespace api.Models;

public partial class ParametroSalario
{
    public int IdParametroSalario { get; set; }

    public DateOnly FechaDesde { get; set; }

    public DateOnly? FechaHasta { get; set; }

    public decimal SalarioMinimo { get; set; }

    public decimal PorcentajeIpsEmpleado { get; set; } = 9m;

    public decimal PorcentajeBonificacionFamiliar { get; set; } = 5m;

    public bool Activo { get; set; } = true;
}
