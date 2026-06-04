using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ModelosAsientosDetalleService : CrudServiceBase<ModelosAsientosDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public ModelosAsientosDetalleService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<ModelosAsientosDetalle> Set => _context.ModelosAsientosDetalles;

    protected override IQueryable<ModelosAsientosDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<ModelosAsientosDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<ModelosAsientosDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdModeloAsientoDetalle == id;
    }

    protected override void UpdateEntity(ModelosAsientosDetalle existingEntity, ModelosAsientosDetalle incomingEntity)
    {
        existingEntity.IdModeloAsiento = incomingEntity.IdModeloAsiento;
        existingEntity.IdCuentaContable = incomingEntity.IdCuentaContable;
        existingEntity.Item = incomingEntity.Item;
        existingEntity.TipoMovimiento = incomingEntity.TipoMovimiento;
        existingEntity.DescripcionItem = incomingEntity.DescripcionItem;
    }

    private IQueryable<ModelosAsientosDetalle> BuildQuery()
    {
        return _context.ModelosAsientosDetalles
            .Include(detalle => detalle.IdModeloAsientoNavigation)
            .Include(detalle => detalle.IdCuentaContableNavigation);
    }
}
