using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ModuloService : CrudServiceBase<Modulo, int>
{
    private readonly DblosAmigosContext _context;

    public ModuloService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<Modulo> Set => _context.Modulos;

    protected override IQueryable<Modulo> BuildReadQuery()
    {
        return _context.Modulos.AsNoTracking();
    }

    protected override Expression<Func<Modulo, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdModulo == id;
    }

    protected override void UpdateEntity(Modulo existingEntity, Modulo incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
