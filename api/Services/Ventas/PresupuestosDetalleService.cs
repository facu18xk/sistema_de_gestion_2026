using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PresupuestosDetalleService : CrudServiceBase<PresupuestosDetalle, int>
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public PresupuestosDetalleService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
        : base(context)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
    }

    protected override DbSet<PresupuestosDetalle> Set => _context.PresupuestosDetalles;

    protected override IQueryable<PresupuestosDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PresupuestosDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PresupuestosDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPresupuestoDetalle == id;
    }

    public override async Task<PresupuestosDetalle> CreateAsync(PresupuestosDetalle entity)
    {
        await ApplyBackendCalculatedAmountsAsync(entity);
        return await base.CreateAsync(entity);
    }

    public override async Task<PresupuestosDetalle> UpdateAsync(int id, PresupuestosDetalle entity)
    {
        await ApplyBackendCalculatedAmountsAsync(entity);
        return await base.UpdateAsync(id, entity);
    }

    protected override void UpdateEntity(PresupuestosDetalle existingEntity, PresupuestosDetalle incomingEntity)
    {
        existingEntity.IdPresupuesto = incomingEntity.IdPresupuesto;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Iva = incomingEntity.Iva;
        existingEntity.Subtotal = incomingEntity.Subtotal;
    }

    private IQueryable<PresupuestosDetalle> BuildQuery()
    {
        return _context.PresupuestosDetalles
            .Include(entity => entity.IdPresupuestoNavigation)
            .Include(entity => entity.IdProductoNavigation);
    }

    private async Task ApplyBackendCalculatedAmountsAsync(PresupuestosDetalle entity)
    {
        if (entity.Cantidad <= 0)
        {
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");
        }

        var porcentajeIva = await _context.Productos
            .Where(producto => producto.IdProducto == entity.IdProducto)
            .Select(producto => (decimal?)producto.PorcentajeIva)
            .FirstOrDefaultAsync();

        if (porcentajeIva is null)
        {
            throw new InvalidOperationException($"No existe el producto {entity.IdProducto}.");
        }

        entity.PrecioUnitario = await _salesPriceResolver.ResolvePrecioUnitarioAsync(entity.IdProducto, entity.PrecioUnitario);
        entity.Iva = porcentajeIva.Value;

        var totalBruto = Math.Round(entity.Cantidad * entity.PrecioUnitario, 2, MidpointRounding.AwayFromZero);
        var totalIva = IvaCalculator.CalculateTotal(totalBruto, entity.Iva);
        entity.Subtotal = totalBruto + totalIva;
    }
}
