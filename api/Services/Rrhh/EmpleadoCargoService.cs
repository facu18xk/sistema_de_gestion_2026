using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EmpleadoCargoService : CrudServiceBase<EmpleadoCargo, int>
{
    private readonly DblosAmigosContext _context;

    public EmpleadoCargoService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<EmpleadoCargo> Set => _context.EmpleadosCargos;

    protected override IQueryable<EmpleadoCargo> BuildReadQuery() => BuildQuery().AsNoTracking();

    protected override IQueryable<EmpleadoCargo> BuildGetByIdQuery() => BuildQuery();

    protected override Expression<Func<EmpleadoCargo, bool>> BuildKeyPredicate(int id) => item => item.IdEmpleadoCargo == id;

    public override async Task<EmpleadoCargo> CreateAsync(EmpleadoCargo entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        await ClosePreviousActiveAsync(entity);
        await _context.SaveChangesAsync();
        Set.Add(entity);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return entity;
    }

    public override async Task<EmpleadoCargo> UpdateAsync(int id, EmpleadoCargo entity)
    {
        var existing = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (existing is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {id}");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();
        UpdateEntity(existing, entity);
        await ClosePreviousActiveAsync(existing, existing.IdEmpleadoCargo);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return existing;
    }

    protected override void UpdateEntity(EmpleadoCargo existingEntity, EmpleadoCargo incomingEntity)
    {
        existingEntity.IdEmpleado = incomingEntity.IdEmpleado;
        existingEntity.IdCargo = incomingEntity.IdCargo;
        existingEntity.FechaDesde = incomingEntity.FechaDesde;
        existingEntity.FechaHasta = incomingEntity.FechaHasta;
        existingEntity.Activo = incomingEntity.Activo;
    }

    private async Task ClosePreviousActiveAsync(EmpleadoCargo entity, int? excludeId = null)
    {
        if (!entity.Activo)
        {
            return;
        }

        var previous = await _context.EmpleadosCargos
            .Where(item => item.IdEmpleado == entity.IdEmpleado && item.Activo)
            .Where(item => excludeId == null || item.IdEmpleadoCargo != excludeId.Value)
            .ToListAsync();

        foreach (var item in previous)
        {
            item.Activo = false;
            item.FechaHasta = entity.FechaDesde.AddDays(-1);
        }
    }

    private IQueryable<EmpleadoCargo> BuildQuery()
    {
        return _context.EmpleadosCargos
            .Include(item => item.IdCargoNavigation)
            .Include(item => item.IdEmpleadoNavigation)
                .ThenInclude(item => item.IdPersonaNavigation);
    }
}
