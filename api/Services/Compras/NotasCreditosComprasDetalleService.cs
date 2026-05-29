using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasCreditosComprasDetalleService : CrudServiceBase<NotasCreditosComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public NotasCreditosComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasCreditosComprasDetalle> Set => _context.NotasCreditosComprasDetalles;

    protected override IQueryable<NotasCreditosComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasCreditosComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasCreditosComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaCreditoCompraDetalle == id;
    }

    protected override void UpdateEntity(NotasCreditosComprasDetalle existingEntity, NotasCreditosComprasDetalle incomingEntity)
    {
        existingEntity.IdNotaCreditoCompra = incomingEntity.IdNotaCreditoCompra;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Subtotal = incomingEntity.Subtotal;
    }

    private IQueryable<NotasCreditosComprasDetalle> BuildQuery()
    {
        return _context.NotasCreditosComprasDetalles
            .Include(d => d.IdNotaCreditoCompraNavigation)
            .Include(d => d.IdProductoNavigation);
    }
}