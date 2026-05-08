using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CuentaContableService : CrudServiceBase<CuentaContable, int>
{
    private readonly DblosAmigosContext _context;

    public CuentaContableService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<CuentaContable> Set => _context.CuentasContables;

    protected override IQueryable<CuentaContable> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<CuentaContable> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<CuentaContable, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdCuentaContable == id;
    }

    protected override void UpdateEntity(CuentaContable existingEntity, CuentaContable incomingEntity)
    {
        existingEntity.IdProcesoContable = incomingEntity.IdProcesoContable;
        existingEntity.IdCuentaPadre = incomingEntity.IdCuentaPadre;
        existingEntity.NumeroCuenta = incomingEntity.NumeroCuenta;
        existingEntity.Nombre = incomingEntity.Nombre;
        existingEntity.TipoCuenta = incomingEntity.TipoCuenta;
        existingEntity.EsAsentable = incomingEntity.EsAsentable;
        existingEntity.Activa = incomingEntity.Activa;
    }

    private IQueryable<CuentaContable> BuildQuery()
    {
        return _context.CuentasContables
            .Include(cuenta => cuenta.IdProcesoContableNavigation)
            .Include(cuenta => cuenta.IdCuentaPadreNavigation);
    }
}
