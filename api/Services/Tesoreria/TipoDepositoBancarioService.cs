using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class TipoDepositoBancarioService : CrudServiceBase<TipoDepositoBancario, int>
{
    private readonly DblosAmigosContext _context;

    public TipoDepositoBancarioService(DblosAmigosContext context) : base(context) => _context = context;

    protected override DbSet<TipoDepositoBancario> Set => _context.TiposDepositosBancarios;

    protected override IQueryable<TipoDepositoBancario> BuildReadQuery() => Set.AsNoTracking().OrderBy(item => item.Nombre);

    protected override Expression<Func<TipoDepositoBancario, bool>> BuildKeyPredicate(int id) => item => item.IdTipoDepositoBancario == id;

    protected override void UpdateEntity(TipoDepositoBancario existingEntity, TipoDepositoBancario incomingEntity)
    {
        existingEntity.Nombre = incomingEntity.Nombre;
    }
}
