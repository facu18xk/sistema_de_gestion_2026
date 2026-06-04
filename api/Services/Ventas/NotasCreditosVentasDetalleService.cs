using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasCreditosVentasDetalleService : CrudServiceBase<NotasCreditosVentasDetalle, int>
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public NotasCreditosVentasDetalleService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
        : base(context)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
    }

    protected override DbSet<NotasCreditosVentasDetalle> Set => _context.NotasCreditosVentasDetalles;

    protected override IQueryable<NotasCreditosVentasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasCreditosVentasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasCreditosVentasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaCreditoVentaDetalle == id;
    }

    public override async Task<NotasCreditosVentasDetalle> CreateAsync(NotasCreditosVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.CreateAsync(entity);
    }

    public override async Task<NotasCreditosVentasDetalle> UpdateAsync(int id, NotasCreditosVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(NotasCreditosVentasDetalle existingEntity, NotasCreditosVentasDetalle incomingEntity)
    {
        existingEntity.IdNotaCreditoVenta = incomingEntity.IdNotaCreditoVenta;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Subtotal = incomingEntity.Subtotal;
    }

    private IQueryable<NotasCreditosVentasDetalle> BuildQuery()
    {
        return _context.NotasCreditosVentasDetalles
            .Include(entity => entity.IdNotaCreditoVentaNavigation)
            .Include(entity => entity.IdProductoNavigation);
    }
}
