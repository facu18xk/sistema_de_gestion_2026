using System.Collections.Generic;

namespace api.Models;

public partial class ConceptoSalario
{
    public int IdConceptoSalario { get; set; }

    public string Codigo { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public bool DeducibleIps { get; set; }

    public bool EsSalarioBase { get; set; }

    public bool EsIps { get; set; }

    public bool EsBonificacionFamiliar { get; set; }

    public bool Activo { get; set; } = true;

    public virtual ICollection<EmpleadoConceptoMensual> EmpleadosConceptosMensuales { get; set; } = new List<EmpleadoConceptoMensual>();

    public virtual ICollection<PagoSalarioDetalle> PagosSalariosDetalles { get; set; } = new List<PagoSalarioDetalle>();
}
