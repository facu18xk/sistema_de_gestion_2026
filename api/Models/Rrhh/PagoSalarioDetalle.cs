namespace api.Models;

public partial class PagoSalarioDetalle
{
    public int IdPagoSalarioDetalle { get; set; }

    public int IdProcesoPagoSalario { get; set; }

    public int IdEmpleado { get; set; }

    public int IdConceptoSalario { get; set; }

    public string Tipo { get; set; } = null!;

    public decimal Monto { get; set; }

    public bool DeducibleIps { get; set; }

    public bool EsAutomatico { get; set; }

    public string? Observacion { get; set; }

    public virtual ProcesoPagoSalario IdProcesoPagoSalarioNavigation { get; set; } = null!;

    public virtual Empleado IdEmpleadoNavigation { get; set; } = null!;

    public virtual ConceptoSalario IdConceptoSalarioNavigation { get; set; } = null!;
}
