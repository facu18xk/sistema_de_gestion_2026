using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesComprasDetalleService : CrudServiceBase<OrdenesComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesComprasDetalle> Set => _context.OrdenesComprasDetalles;

    protected override IQueryable<OrdenesComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery();
    }

    protected override Expression<Func<OrdenesComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return detalle => detalle.IdOrdenCompraDetalle == id;
    }

    protected override void UpdateEntity(OrdenesComprasDetalle existingEntity, OrdenesComprasDetalle incomingEntity)
    {
        existingEntity.IdOrdenCompra = incomingEntity.IdOrdenCompra;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
    }

    public override async Task<OrdenesComprasDetalle> UpdateAsync(int id, OrdenesComprasDetalle entity)
    {
        var existingEntity = await BuildQuery().FirstOrDefaultAsync(BuildKeyPredicate(id));

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el detalle de orden de compra con ID {id}");
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

    private IQueryable<OrdenesComprasDetalle> BuildQuery()
    {
        return _context.OrdenesComprasDetalles
            .Include(detalle => detalle.IdOrdenCompraNavigation)
            .Include(detalle => detalle.IdProductoNavigation);
    }
}