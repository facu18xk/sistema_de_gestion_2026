using System.Collections.Generic;

namespace api.Models;

public partial class Empleado
{
    public virtual ICollection<EmpleadoCargo> EmpleadosCargos { get; set; } = new List<EmpleadoCargo>();

    public virtual ICollection<EmpleadoConceptoMensual> EmpleadosConceptosMensuales { get; set; } = new List<EmpleadoConceptoMensual>();

    public virtual ICollection<PagoSalarioDetalle> PagosSalariosDetalles { get; set; } = new List<PagoSalarioDetalle>();
}
