namespace api.Models;

public partial class EmpleadoConceptoMensual
{
    public int IdEmpleadoConceptoMensual { get; set; }

    public int IdEmpleado { get; set; }

    public int IdConceptoSalario { get; set; }

    public decimal Monto { get; set; }

    public DateOnly FechaDesde { get; set; }

    public DateOnly? FechaHasta { get; set; }

    public bool Activo { get; set; } = true;

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;

    public virtual ConceptoSalario IdConceptoSalarioNavigation { get; set; } = null!;
}
