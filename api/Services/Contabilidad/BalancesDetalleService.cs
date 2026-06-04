using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BalancesDetalleService : CrudServiceBase<BalancesDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public BalancesDetalleService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<BalancesDetalle> Set => _context.BalancesDetalles;

    protected override IQueryable<BalancesDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<BalancesDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<BalancesDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdBalanceDetalle == id;
    }

    protected override void UpdateEntity(BalancesDetalle existingEntity, BalancesDetalle incomingEntity)
    {
        existingEntity.IdBalance = incomingEntity.IdBalance;
        existingEntity.IdCuentaContable = incomingEntity.IdCuentaContable;
        existingEntity.TotalDebe = incomingEntity.TotalDebe;
        existingEntity.TotalHaber = incomingEntity.TotalHaber;
        existingEntity.SaldoDeudor = incomingEntity.SaldoDeudor;
        existingEntity.SaldoAcreedor = incomingEntity.SaldoAcreedor;
    }

    private IQueryable<BalancesDetalle> BuildQuery()
    {
        return _context.BalancesDetalles
            .Include(detalle => detalle.IdBalanceNavigation)
            .Include(detalle => detalle.IdCuentaContableNavigation);
    }
}
