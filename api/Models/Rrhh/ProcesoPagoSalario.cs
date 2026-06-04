using System.Collections.Generic;

namespace api.Models;

public partial class ProcesoPagoSalario
{
    public int IdProcesoPagoSalario { get; set; }

    public int PeriodoAnho { get; set; }

    public int PeriodoMes { get; set; }

    public DateOnly FechaPago { get; set; }

    public string Estado { get; set; } = PagoSalarioEstados.Abierto;

    public int? IdAsiento { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime? CerradoAt { get; set; }

    public virtual Asiento? IdAsientoNavigation { get; set; }

    public virtual ICollection<PagoSalarioDetalle> PagosSalariosDetalles { get; set; } = new List<PagoSalarioDetalle>();
}
