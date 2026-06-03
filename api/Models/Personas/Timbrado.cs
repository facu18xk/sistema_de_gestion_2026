using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Timbrado
{
    public int IdTimbrado { get; set; }

<<<<<<< HEAD
    public string NumeroTimbrado { get; set; } = null!;

=======
>>>>>>> front
    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinal { get; set; }

    public string Ruc { get; set; } = null!;

<<<<<<< HEAD
    public string Establecimiento { get; set; } = null!;

    public string PuntoExpedicion { get; set; } = null!;

    public int NumeroInicial { get; set; }

    public int NumeroFinal { get; set; }

    public int UltimoNumeroUsado { get; set; }

    public string TipoComprobante { get; set; } = null!;

    public bool Activo { get; set; }

=======
>>>>>>> front
    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual ICollection<NotasCreditosVenta> NotasCreditosVenta { get; set; } = new List<NotasCreditosVenta>();
}
