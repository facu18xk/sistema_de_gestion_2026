using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PeriodoContableGeneratorService : IPeriodoContableGeneratorService
{
    private readonly DblosAmigosContext _context;

    public PeriodoContableGeneratorService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<List<PeriodoContable>> GenerateYearPeriodsAsync(int idProcesoContable)
    {
        var proceso = await _context.ProcesosContables
            .FirstOrDefaultAsync(item => item.IdProcesoContable == idProcesoContable);

        if (proceso is null)
        {
            throw new InvalidOperationException("No existe el proceso contable indicado.");
        }

        if (!ContabilidadRules.IsEnabled(proceso.Estado))
        {
            throw new InvalidOperationException("El proceso contable no se encuentra habilitado.");
        }

        var existingMonths = await _context.PeriodosContables
            .Where(item => item.IdProcesoContable == idProcesoContable)
            .Select(item => item.Mes)
            .ToListAsync();

        var periods = Enumerable.Range(1, 12)
            .Where(month => !existingMonths.Contains(month))
            .Select(month =>
            {
                var firstDay = new DateOnly(proceso.PeriodoAnho, month, 1);
                return new PeriodoContable
                {
                    IdProcesoContable = idProcesoContable,
                    Anho = proceso.PeriodoAnho,
                    Mes = month,
                    FechaInicio = firstDay,
                    FechaFin = firstDay.AddMonths(1).AddDays(-1),
<<<<<<< HEAD
                    Estado = ContabilidadEstados.Habilitado
=======
                    Estado = "Habilitado"
>>>>>>> front
                };
            })
            .ToList();

        if (periods.Count > 0)
        {
            _context.PeriodosContables.AddRange(periods);
            await _context.SaveChangesAsync();
        }

        return await _context.PeriodosContables
            .Include(item => item.IdProcesoContableNavigation)
            .Where(item => item.IdProcesoContable == idProcesoContable)
            .OrderBy(item => item.Mes)
            .ToListAsync();
    }
}
