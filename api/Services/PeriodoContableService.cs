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
}
