using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesMediosPagosCompraService : CrudServiceBase<OrdenesMediosPagosCompra, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesMediosPagosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesMediosPagosCompra> Set => _context.OrdenesMediosPagosCompras;

    protected override IQueryable<OrdenesMediosPagosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesMediosPagosCompra> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<OrdenesMediosPagosCompra, bool>> BuildKeyPredicate(int id)
    {
        return detalle => detalle.IdOrdenMedioPagoCompra == id;
    }

    protected override void UpdateEntity(OrdenesMediosPagosCompra existingEntity, OrdenesMediosPagosCompra incomingEntity)
    {
        existingEntity.IdOrdenPagoCompra = incomingEntity.IdOrdenPagoCompra;
        existingEntity.IdMedioPagoCompra = incomingEntity.IdMedioPagoCompra;
        existingEntity.Monto = incomingEntity.Monto;
    }

    public override async Task<OrdenesMediosPagosCompra> UpdateAsync(int id, OrdenesMediosPagosCompra entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro de medio de pago con ID {id}");
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

    private IQueryable<OrdenesMediosPagosCompra> BuildQuery()
    {
        return _context.OrdenesMediosPagosCompras
            .Include(o => o.IdOrdenPagoCompraNavigation)
            .Include(o => o.IdMedioPagoCompraNavigation);
    }
}