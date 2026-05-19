using api.Dtos.Contabilidad;

namespace api.Services;

public interface IAsientoContableService
{
    Task<AsientoCompletoDto> CreateManualAsync(AsientoCompletoUpsertDto dto);

    Task<AsientoCompletoDto> UpdateManualAsync(int idAsiento, AsientoCompletoUpsertDto dto);

    Task<AsientoCompletoDto> GenerateFromModeloAsync(GenerarAsientoDesdeModeloDto dto);
}
