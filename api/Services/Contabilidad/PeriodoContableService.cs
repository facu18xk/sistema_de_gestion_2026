using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PeriodoContableService : CrudServiceBase<PeriodoContable, int>
{
    private readonly DblosAmigosContext _context;

    public PeriodoContableService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<PeriodoContable> Set => _context.PeriodosContables;

    protected override IQueryable<PeriodoContable> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PeriodoContable> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PeriodoContable, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPeriodoContable == id;
    }

    public override async Task<PeriodoContable> CreateAsync(PeriodoContable entity)
    {
        await ValidatePeriodoAsync(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<PeriodoContable> UpdateAsync(int id, PeriodoContable entity)
    {
        await ValidatePeriodoAsync(entity);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(PeriodoContable existingEntity, PeriodoContable incomingEntity)
    {
        existingEntity.IdProcesoContable = incomingEntity.IdProcesoContable;
        existingEntity.Anho = incomingEntity.Anho;
        existingEntity.Mes = incomingEntity.Mes;
        existingEntity.FechaInicio = incomingEntity.FechaInicio;
        existingEntity.FechaFin = incomingEntity.FechaFin;
        existingEntity.Estado = incomingEntity.Estado;
    }

    private IQueryable<PeriodoContable> BuildQuery()
    {
        return _context.PeriodosContables
            .Include(periodo => periodo.IdProcesoContableNavigation);
    }

    private async Task ValidatePeriodoAsync(PeriodoContable entity)
    {
        if (entity.Mes is < 1 or > 12)
        {
            throw new InvalidOperationException("El mes del periodo contable debe estar entre 1 y 12.");
        }

        if (entity.FechaInicio > entity.FechaFin)
        {
            throw new InvalidOperationException("La fecha de inicio no puede ser posterior a la fecha fin.");
        }

        var proceso = await _context.ProcesosContables
            .FirstOrDefaultAsync(item => item.IdProcesoContable == entity.IdProcesoContable);

        if (proceso is null)
        {
            throw new InvalidOperationException("No existe el proceso contable indicado.");
        }

        if (!ContabilidadRules.IsEnabled(proceso.Estado))
        {
            throw new InvalidOperationException("El proceso contable no se encuentra habilitado.");
        }

        if (entity.Anho != proceso.PeriodoAnho)
        {
            throw new InvalidOperationException("El año del periodo debe coincidir con el proceso contable.");
        }

        if (entity.FechaInicio.Year != entity.Anho ||
            entity.FechaFin.Year != entity.Anho ||
            entity.FechaInicio.Month != entity.Mes ||
            entity.FechaFin.Month != entity.Mes)
        {
            throw new InvalidOperationException("Las fechas del periodo deben corresponder al mes y año indicados.");
        }
    }
}
