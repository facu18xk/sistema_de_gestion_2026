using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasDevolucionesVentasDetalleService : CrudServiceBase<NotasDevolucionesVentasDetalle, int>
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public NotasDevolucionesVentasDetalleService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
        : base(context)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
    }

    protected override DbSet<NotasDevolucionesVentasDetalle> Set => _context.NotasDevolucionesVentasDetalles;

    protected override IQueryable<NotasDevolucionesVentasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasDevolucionesVentasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasDevolucionesVentasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaDevolucionVentaDetalle == id;
    }

    public override async Task<NotasDevolucionesVentasDetalle> CreateAsync(NotasDevolucionesVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.CreateAsync(entity);
    }

    public override async Task<NotasDevolucionesVentasDetalle> UpdateAsync(int id, NotasDevolucionesVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(NotasDevolucionesVentasDetalle existingEntity, NotasDevolucionesVentasDetalle incomingEntity)
    {
        existingEntity.IdNotaDevolucionVenta = incomingEntity.IdNotaDevolucionVenta;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Subtotal = incomingEntity.Subtotal;
    }

    private IQueryable<NotasDevolucionesVentasDetalle> BuildQuery()
    {
        return _context.NotasDevolucionesVentasDetalles
            .Include(entity => entity.IdNotaDevolucionVentaNavigation)
            .Include(entity => entity.IdProductoNavigation);
    }
}
