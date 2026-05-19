using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BalanceService : CrudServiceBase<Balance, int>
{
    private readonly DblosAmigosContext _context;

    public BalanceService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<Balance> Set => _context.Balances;

    protected override IQueryable<Balance> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Balance> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<Balance, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdBalance == id;
    }

    protected override void UpdateEntity(Balance existingEntity, Balance incomingEntity)
    {
        existingEntity.TipoBalance = incomingEntity.TipoBalance;
        existingEntity.IdPeriodoContable = incomingEntity.IdPeriodoContable;
        existingEntity.FechaGeneracion = incomingEntity.FechaGeneracion;
    }

    private IQueryable<Balance> BuildQuery()
    {
        return _context.Balances
            .Include(balance => balance.IdPeriodoContableNavigation);
    }
}
