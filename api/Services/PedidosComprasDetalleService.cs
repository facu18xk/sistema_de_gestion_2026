using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PedidosComprasDetalleService : CrudServiceBase<PedidosComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public PedidosComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<PedidosComprasDetalle> Set => _context.PedidosComprasDetalles;

    protected override IQueryable<PedidosComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PedidosComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PedidosComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPedidoCompraDetalle == id;
    }

    protected override void UpdateEntity(PedidosComprasDetalle existingEntity, PedidosComprasDetalle incomingEntity)
    {
        existingEntity.IdPedidoCompra = incomingEntity.IdPedidoCompra;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Categoria = incomingEntity.Categoria;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.Cantidad = incomingEntity.Cantidad;
    }

    private IQueryable<PedidosComprasDetalle> BuildQuery()
    {
        return _context.PedidosComprasDetalles
            .Include(detalle => detalle.IdPedidoCompraNavigation)
            .Include(detalle => detalle.IdProductoNavigation);
    }
}
