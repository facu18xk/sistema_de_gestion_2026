using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TipoMovimientoBancarioService : CrudServiceBase<TipoMovimientoBancario, int>
{
    private readonly DblosAmigosContext _context;

    public TipoMovimientoBancarioService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<TipoMovimientoBancario> Set => _context.TiposMovimientosBancarios;

    protected override IQueryable<TipoMovimientoBancario> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Nombre);

    protected override Expression<Func<TipoMovimientoBancario, bool>> BuildKeyPredicate(int id) => item => item.IdTipoMovimientoBancario == id;

    protected override void UpdateEntity(TipoMovimientoBancario existingEntity, TipoMovimientoBancario incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
