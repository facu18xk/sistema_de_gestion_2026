using System.Collections.Generic;

namespace api.Models;

public partial class Asiento
{
    public virtual ICollection<ProcesoPagoSalario> ProcesosPagosSalarios { get; set; } = new List<ProcesoPagoSalario>();
}
