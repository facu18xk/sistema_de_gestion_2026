using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AsientosDetalleService : CrudServiceBase<AsientosDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public AsientosDetalleService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<AsientosDetalle> Set => _context.AsientosDetalles;

    protected override IQueryable<AsientosDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<AsientosDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<AsientosDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdAsientoDetalle == id;
    }

    public override async Task<AsientosDetalle> CreateAsync(AsientosDetalle entity)
    {
        await Task.CompletedTask;
        throw new InvalidOperationException("Registre detalles desde el endpoint /api/Asientos/completo para garantizar la partida doble.");
    }

    public override async Task<AsientosDetalle> UpdateAsync(int id, AsientosDetalle entity)
    {
        await Task.CompletedTask;
        throw new InvalidOperationException("Modifique detalles desde el endpoint /api/Asientos/completo/{id} para garantizar la partida doble.");
    }

    public override async Task DeleteAsync(int id)
    {
        await Task.CompletedTask;
        throw new InvalidOperationException("Modifique detalles desde el endpoint /api/Asientos/completo/{id} para garantizar la partida doble.");
    }

    protected override void UpdateEntity(AsientosDetalle existingEntity, AsientosDetalle incomingEntity)
    {
        existingEntity.IdAsiento = incomingEntity.IdAsiento;
        existingEntity.IdCuentaContable = incomingEntity.IdCuentaContable;
        existingEntity.Item = incomingEntity.Item;
        existingEntity.TipoMovimiento = incomingEntity.TipoMovimiento;
        existingEntity.Monto = incomingEntity.Monto;
        existingEntity.DescripcionItem = incomingEntity.DescripcionItem;
    }

    private IQueryable<AsientosDetalle> BuildQuery()
    {
        return _context.AsientosDetalles
            .Include(detalle => detalle.IdAsientoNavigation)
            .Include(detalle => detalle.IdCuentaContableNavigation);
    }

}
