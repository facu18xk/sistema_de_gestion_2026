using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Timbrado
{
    public int IdTimbrado { get; set; }

    public string NumeroTimbrado { get; set; } = null!;

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinal { get; set; }

    public string Ruc { get; set; } = null!;

    public string Establecimiento { get; set; } = null!;

    public string PuntoExpedicion { get; set; } = null!;

    public int NumeroInicial { get; set; }

    public int NumeroFinal { get; set; }

    public int UltimoNumeroUsado { get; set; }

    public string TipoComprobante { get; set; } = null!;

    public bool Activo { get; set; }

    public virtual ICollection<FacturasVenta> FacturasVenta { get; set; } = new List<FacturasVenta>();

    public virtual ICollection<NotasCreditosVenta> NotasCreditosVenta { get; set; } = new List<NotasCreditosVenta>();
}
