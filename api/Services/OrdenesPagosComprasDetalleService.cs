using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesPagosComprasDetalleService : CrudServiceBase<OrdenesPagosComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesPagosComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesPagosComprasDetalle> Set => _context.OrdenesPagosComprasDetalles;

    protected override IQueryable<OrdenesPagosComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesPagosComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<OrdenesPagosComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return detalle => detalle.IdOrdenPagoCompraDetalle == id;
    }

    protected override void UpdateEntity(OrdenesPagosComprasDetalle existingEntity, OrdenesPagosComprasDetalle incomingEntity)
    {
        existingEntity.IdOrdenPagoCompra = incomingEntity.IdOrdenPagoCompra;
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.Monto = incomingEntity.Monto;
    }

    public override async Task<OrdenesPagosComprasDetalle> UpdateAsync(int id, OrdenesPagosComprasDetalle entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el detalle de la orden de pago con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return existingEntity;
    }

    public override async Task DeleteAsync(int id)
    {
        var entity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));
        if (entity is null)
        {
            return;
        }

        Set.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private IQueryable<OrdenesPagosComprasDetalle> BuildQuery()
    {
        return _context.OrdenesPagosComprasDetalles
            .Include(detalle => detalle.IdOrdenPagoCompraNavigation)
            .Include(detalle => detalle.IdFacturaCompraNavigation);
    }
}