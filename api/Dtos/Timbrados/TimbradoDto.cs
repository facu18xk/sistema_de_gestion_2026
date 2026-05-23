namespace api.Dtos.Timbrados;

public class TimbradoDto
{
    public int IdTimbrado { get; set; }

    public string NumeroTimbrado { get; set; } = string.Empty;

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinal { get; set; }

    public string Ruc { get; set; } = string.Empty;

    public string Establecimiento { get; set; } = string.Empty;

    public string PuntoExpedicion { get; set; } = string.Empty;

    public int NumeroInicial { get; set; }

    public int NumeroFinal { get; set; }

    public int UltimoNumeroUsado { get; set; }

    public string TipoComprobante { get; set; } = string.Empty;

    public bool Activo { get; set; }
}

public class TimbradoUpsertDto
{
    public string NumeroTimbrado { get; set; } = string.Empty;

    public DateOnly FechaInicio { get; set; }

    public DateOnly FechaFinal { get; set; }

    public string Ruc { get; set; } = string.Empty;

    public string Establecimiento { get; set; } = "001";

    public string PuntoExpedicion { get; set; } = "001";

    public int NumeroInicial { get; set; } = 1;

    public int NumeroFinal { get; set; } = 9999999;

    public int UltimoNumeroUsado { get; set; }

    public string TipoComprobante { get; set; } = "Factura";

    public bool Activo { get; set; } = true;
}
