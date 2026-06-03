using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ParienteService : CrudServiceBase<Pariente, int>
{
    private readonly DblosAmigosContext _context;

    public ParienteService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Pariente> Set => _context.Parientes;

    protected override IQueryable<Pariente> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Pariente> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<Pariente, bool>> BuildKeyPredicate(int id)
    {
        return p => p.IdPariente == id;
    }

    protected override void UpdateEntity(Pariente existingEntity, Pariente incomingEntity)
    {
        existingEntity.IdEmpleado = incomingEntity.IdEmpleado;
        existingEntity.TipoRelacion = incomingEntity.TipoRelacion;
        existingEntity.Edad = incomingEntity.Edad;
        existingEntity.FechaNacimiento = incomingEntity.FechaNacimiento;
<<<<<<< HEAD
        existingEntity.Nombre = incomingEntity.Nombre;
        existingEntity.Apellido = incomingEntity.Apellido;
        existingEntity.Ci = incomingEntity.Ci;
=======
>>>>>>> front
    }

    public override async Task<Pariente> UpdateAsync(int id, Pariente entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el pariente con ID {id}");
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

    private IQueryable<Pariente> BuildQuery()
    {
        return _context.Parientes
            .Include(p => p.IdEmpleadoNavigation)
                .ThenInclude(e => e.IdPersonaNavigation);
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> front
