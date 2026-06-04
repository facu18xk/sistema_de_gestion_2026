using api.Models;

namespace api.Services;

public interface IPeriodoContableGeneratorService
{
    Task<List<PeriodoContable>> GenerateYearPeriodsAsync(int idProcesoContable);
}
