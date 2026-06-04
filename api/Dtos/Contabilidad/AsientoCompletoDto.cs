using api.Dtos.Asientos;
using api.Dtos.AsientosDetalles;

namespace api.Dtos.Contabilidad;

public class AsientoCompletoUpsertDto
{
    public int? IdModulo { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public bool Automatico { get; set; }
    public string Estado { get; set; } = "Registrado";
    public string? ReferenciaOrigen { get; set; }
    public int? IdOrigen { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? FechaMayorizacion { get; set; }
    public List<AsientosDetalleUpsertDto> Detalles { get; set; } = new();
}

public class AsientoCompletoDto
{
    public AsientoDto Asiento { get; set; } = new();
    public List<AsientosDetalleDto> Detalles { get; set; } = new();
}

public class GenerarAsientoDesdeModeloDto
{
    public int IdModeloAsiento { get; set; }
    public DateOnly Fecha { get; set; }
    public string? Descripcion { get; set; }
    public string? ReferenciaOrigen { get; set; }
    public int? IdOrigen { get; set; }
    public List<GenerarAsientoModeloDetalleDto> Detalles { get; set; } = new();
}

public class GenerarAsientoModeloDetalleDto
{
    public int IdModeloAsientoDetalle { get; set; }
    public decimal Monto { get; set; }
    public string? DescripcionItem { get; set; }
}
