using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PreciosVentasService : CrudServiceBase<PrecioVenta, int>
{
    private readonly DblosAmigosContext _context;

    public PreciosVentasService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<PrecioVenta> Set => _context.PreciosVentas;

    protected override IQueryable<PrecioVenta> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PrecioVenta> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PrecioVenta, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPrecioVenta == id;
    }

    public async Task<PrecioVenta?> GetActiveByProductAsync(int idProducto)
    {
        return await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(precio => precio.IdProducto == idProducto && precio.Activo);
    }

    public override async Task<PrecioVenta> CreateAsync(PrecioVenta entity)
    {
        var latestPurchasePrice = await _context.FacturasComprasDetalles
            .Where(detalle => detalle.IdProducto == entity.IdProducto)
            .OrderByDescending(detalle => detalle.IdFacturaCompraNavigation.Fecha)
            .ThenByDescending(detalle => detalle.IdFacturaCompraDetalle)
            .Select(detalle => (decimal?)detalle.PrecioUnitario)
            .FirstOrDefaultAsync();

        if (latestPurchasePrice is null)
        {
            throw new InvalidOperationException($"El producto {entity.IdProducto} no tiene historial de compras");
        }

        var now = DateTime.Now;
        var activePrice = await _context.PreciosVentas
            .FirstOrDefaultAsync(precio => precio.IdProducto == entity.IdProducto && precio.Activo);

        if (activePrice is not null)
        {
            activePrice.Activo = false;
            activePrice.FechaHasta = now;
        }

        entity.PrecioCompraBase = latestPurchasePrice.Value;
        entity.PrecioVentaValor = PrecioVentaCalculator.Calcular(entity.PrecioCompraBase, entity.PorcentajeGanancia);
        entity.Activo = true;
        entity.FechaDesde = now;
        entity.FechaHasta = null;

        Set.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    protected override void UpdateEntity(PrecioVenta existingEntity, PrecioVenta incomingEntity)
    {
        existingEntity.PorcentajeGanancia = incomingEntity.PorcentajeGanancia;
        existingEntity.PrecioVentaValor = PrecioVentaCalculator.Calcular(
            existingEntity.PrecioCompraBase,
            incomingEntity.PorcentajeGanancia);
    }

    public override async Task<PrecioVenta> UpdateAsync(int id, PrecioVenta entity)
    {
        var existingEntity = await Set.FindAsync(id);

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el precio de venta con ID {id}");
        }

        UpdateEntity(existingEntity, entity);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id) ?? existingEntity;
    }

    private IQueryable<PrecioVenta> BuildQuery()
    {
        return _context.PreciosVentas
            .Include(entity => entity.IdProductoNavigation);
    }
}
