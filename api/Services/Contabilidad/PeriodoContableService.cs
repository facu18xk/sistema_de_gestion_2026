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
        await ValidatePeriodoAsync(entity, id);
        return await base.UpdateAsync(id, entity);
    }

    public override async Task DeleteAsync(int id)
    {
        var hasAsientos = await _context.Asientos
            .AnyAsync(item => item.IdPeriodoContable == id);
        if (hasAsientos)
        {
            throw new InvalidOperationException("No se puede eliminar el periodo contable porque tiene asientos registrados.");
        }

        var hasBalances = await _context.Balances
            .AnyAsync(item => item.IdPeriodoContable == id);
        if (hasBalances)
        {
            throw new InvalidOperationException("No se puede eliminar el periodo contable porque tiene balances registrados.");
        }

        await base.DeleteAsync(id);
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

    private async Task ValidatePeriodoAsync(PeriodoContable entity, int? existingId = null)
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

        var isAnnualPeriodo =
            entity.FechaInicio == new DateOnly(entity.Anho, 1, 1) &&
            entity.FechaFin == new DateOnly(entity.Anho, 12, 31);

        var isMonthlyPeriodo =
            entity.FechaInicio.Year == entity.Anho &&
            entity.FechaFin.Year == entity.Anho &&
            entity.FechaInicio.Month == entity.Mes &&
            entity.FechaFin.Month == entity.Mes;

        if (!isAnnualPeriodo && !isMonthlyPeriodo)
        {
            throw new InvalidOperationException("Las fechas del periodo deben corresponder al año del proceso contable.");
        }

        var duplicateExists = await _context.PeriodosContables
            .AnyAsync(item =>
                item.IdProcesoContable == entity.IdProcesoContable &&
                item.Anho == entity.Anho &&
                (isAnnualPeriodo || item.Mes == entity.Mes) &&
                (!existingId.HasValue || item.IdPeriodoContable != existingId.Value));

        if (duplicateExists)
        {
            throw new InvalidOperationException("Ya existe un periodo contable para ese proceso y año.");
        }
    }
}
