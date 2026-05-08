using api.Dtos.Contabilidad;

namespace api.Services;

public interface IContabilidadReportesService
{
    Task<List<LibroDiarioLineaDto>> GetLibroDiarioAsync(int idPeriodoContable);

    Task<List<LibroMayorCuentaDto>> GetLibroMayorAsync(int idPeriodoContable);

    Task<List<BalanceLineaDto>> GetBalanceSumasYSaldosAsync(int idPeriodoContable);

    Task<List<BalanceLineaDto>> GetBalanceGeneralAsync(int idPeriodoContable);

    Task<List<BalanceLineaDto>> GetBalanceResultadosAsync(int idPeriodoContable);
}
