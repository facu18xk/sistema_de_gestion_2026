using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasComprasDetalleService : CrudServiceBase<FacturasComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public FacturasComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<FacturasComprasDetalle> Set => _context.FacturasComprasDetalles;

    protected override IQueryable<FacturasComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<FacturasComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<FacturasComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return detalle => detalle.IdFacturaCompraDetalle == id;
    }

    protected override void UpdateEntity(FacturasComprasDetalle existingEntity, FacturasComprasDetalle incomingEntity)
    {
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.TotalBruto = incomingEntity.TotalBruto;
        existingEntity.TotalIva = incomingEntity.TotalIva;
        existingEntity.TotalNeto = incomingEntity.TotalNeto;
    }

    public override async Task<FacturasComprasDetalle> UpdateAsync(int id, FacturasComprasDetalle entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el detalle de factura con ID {id}");
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

    private IQueryable<FacturasComprasDetalle> BuildQuery()
    {
        return _context.FacturasComprasDetalles
            .Include(detalle => detalle.IdFacturaCompraNavigation)
            .Include(detalle => detalle.IdProductoNavigation);
    }
}