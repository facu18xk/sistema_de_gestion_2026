using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class EmpleadoService : CrudServiceBase<Empleado, int>
{
    private readonly DblosAmigosContext _context;

    public EmpleadoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Empleado> Set => _context.Empleados;

    protected override IQueryable<Empleado> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Empleado> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Empleado, bool>> BuildKeyPredicate(int id)
    {
        return e => e.IdEmpleado == id;
    }

    protected override void UpdateEntity(Empleado existingEntity, Empleado incomingEntity)
    {
        existingEntity.IdPersona = incomingEntity.IdPersona;
        existingEntity.Ci = incomingEntity.Ci;
        existingEntity.Ruc = incomingEntity.Ruc;
        existingEntity.FechaIngreso = incomingEntity.FechaIngreso;
    }

    public override async Task<Empleado> UpdateAsync(int id, Empleado entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el empleado con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return existingEntity;
    }

    public override async Task DeleteAsync(int id)
    {
        var entity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private IQueryable<Empleado> BuildQuery()
    {
        return _context.Empleados
            .Include(e => e.IdPersonaNavigation);
    }
}
