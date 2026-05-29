using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasVentasDetalleService : CrudServiceBase<FacturasVentasDetalle, int>
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public FacturasVentasDetalleService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
        : base(context)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
    }

    protected override DbSet<FacturasVentasDetalle> Set => _context.FacturasVentasDetalles;

    protected override IQueryable<FacturasVentasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<FacturasVentasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<FacturasVentasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdFacturaVentaDetalle == id;
    }

    public override async Task<FacturasVentasDetalle> CreateAsync(FacturasVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.CreateAsync(entity);
    }

    public override async Task<FacturasVentasDetalle> UpdateAsync(int id, FacturasVentasDetalle entity)
    {
        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(FacturasVentasDetalle existingEntity, FacturasVentasDetalle incomingEntity)
    {
        existingEntity.IdFacturaVenta = incomingEntity.IdFacturaVenta;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.TotalBruto = incomingEntity.TotalBruto;
        existingEntity.TotalIva = incomingEntity.TotalIva;
        existingEntity.TotalNeto = incomingEntity.TotalNeto;
    }

    private IQueryable<FacturasVentasDetalle> BuildQuery()
    {
        return _context.FacturasVentasDetalles
            .Include(entity => entity.IdFacturaVentaNavigation)
                .ThenInclude(fv => fv.NotasCreditosVenta)
                    .ThenInclude(nc => nc.NotasCreditosVentasDetalles)
            .Include(entity => entity.IdProductoNavigation);
    }
}
