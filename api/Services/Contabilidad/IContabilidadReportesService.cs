using api.Dtos.Contabilidad;

namespace api.Services;

public interface IContabilidadReportesService
{
    Task<LibroDiarioReporteDto> GetLibroDiarioAsync(int idPeriodoContable);

    Task<LibroMayorReporteDto> GetLibroMayorAsync(int idPeriodoContable);

    Task<BalanceSumasYSaldosReporteDto> GetBalanceSumasYSaldosAsync(int idPeriodoContable);

    Task<BalanceGeneralReporteDto> GetBalanceGeneralAsync(int idPeriodoContable);

    Task<BalanceResultadosReporteDto> GetBalanceResultadosAsync(int idPeriodoContable);
}
