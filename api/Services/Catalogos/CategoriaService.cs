using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CategoriaService : CrudServiceBase<Categoria, int>
{
    private readonly DblosAmigosContext _context;

    public CategoriaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Categoria> Set => _context.Categorias;

    protected override IQueryable<Categoria> BuildReadQuery()
    {
        return _context.Categorias
            .OrderBy(c => c.Nombre)
            .AsNoTracking();
    }

    protected override Expression<Func<Categoria, bool>> BuildKeyPredicate(int id)
    {
        return categoria => categoria.IdCategoria == id;
    }

    protected override void UpdateEntity(Categoria existingEntity, Categoria incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
