using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesVentasDetalleService : CrudServiceBase<OrdenesVentasDetalle, int>
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public OrdenesVentasDetalleService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
        : base(context)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
    }

    protected override DbSet<OrdenesVentasDetalle> Set => _context.OrdenesVentasDetalles;

    protected override IQueryable<OrdenesVentasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesVentasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<OrdenesVentasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenVentaDetalle == id;
    }

    public override async Task<OrdenesVentasDetalle> CreateAsync(OrdenesVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.CreateAsync(entity);
    }

    public override async Task<OrdenesVentasDetalle> UpdateAsync(int id, OrdenesVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(OrdenesVentasDetalle existingEntity, OrdenesVentasDetalle incomingEntity)
    {
        existingEntity.IdOrdenVenta = incomingEntity.IdOrdenVenta;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
    }

    private IQueryable<OrdenesVentasDetalle> BuildQuery()
    {
        return _context.OrdenesVentasDetalles
            .Include(entity => entity.IdOrdenVentaNavigation)
            .Include(entity => entity.IdProductoNavigation);
    }
}
