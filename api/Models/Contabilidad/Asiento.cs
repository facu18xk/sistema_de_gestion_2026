using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Asiento
{
    public int IdAsiento { get; set; }

    public int NumeroAsiento { get; set; }

    public int IdPeriodoContable { get; set; }

    public int? IdModulo { get; set; }

    public DateOnly Fecha { get; set; }

    public string? Descripcion { get; set; }

    public bool Automatico { get; set; }

    public string Estado { get; set; } = null!;

    public string? ReferenciaOrigen { get; set; }

    public int? IdOrigen { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? FechaMayorizacion { get; set; }

    public virtual ICollection<AsientosDetalle> AsientosDetalles { get; set; } = new List<AsientosDetalle>();

    public virtual Modulo? IdModuloNavigation { get; set; }

    public virtual PeriodoContable IdPeriodoContableNavigation { get; set; } = null!;
}
