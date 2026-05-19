using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PedidosCompraService : CrudServiceBase<PedidosCompra, int>
{
    private readonly DblosAmigosContext _context;

    public PedidosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<PedidosCompra> Set => _context.PedidosCompras;

    protected override IQueryable<PedidosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PedidosCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PedidosCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPedidoCompra == id;
    }

    protected override void UpdateEntity(PedidosCompra existingEntity, PedidosCompra incomingEntity)
    {
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.NumeroPedido = incomingEntity.NumeroPedido;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    private IQueryable<PedidosCompra> BuildQuery()
    {
        return _context.PedidosCompras
            .Include(pedido => pedido.IdEstadoNavigation);
    }
}
