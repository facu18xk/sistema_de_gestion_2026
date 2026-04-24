using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class MarcaService : CrudServiceBase<Marca, int>
{
    private readonly DblosAmigosContext _context;

    public MarcaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Marca> Set => _context.Marcas;

    protected override IQueryable<Marca> BuildReadQuery()
    {
        return _context.Marcas
            .OrderBy(m => m.Nombre)
            .AsNoTracking();
    }

    protected override Expression<Func<Marca, bool>> BuildKeyPredicate(int id)
    {
        return marca => marca.IdMarca == id;
    }

    protected override void UpdateEntity(Marca existingEntity, Marca incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
