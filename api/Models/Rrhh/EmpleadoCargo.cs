namespace api.Models;

public partial class EmpleadoCargo
{
    public int IdEmpleadoCargo { get; set; }

    public int IdEmpleado { get; set; }

    public int IdCargo { get; set; }

    public DateOnly FechaDesde { get; set; }

    public DateOnly? FechaHasta { get; set; }

    public bool Activo { get; set; } = true;

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;

    public virtual Cargo IdCargoNavigation { get; set; } = null!;
}
