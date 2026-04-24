using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PedidosCotizacionesService : CrudServiceBase<PedidosCotizaciones, int>
{
    private readonly DblosAmigosContext _context;

    public PedidosCotizacionesService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<PedidosCotizaciones> Set => _context.PedidosCotizaciones;

    protected override IQueryable<PedidosCotizaciones> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PedidosCotizaciones> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PedidosCotizaciones, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPedidoCotizacion == id;
    }

    protected override void UpdateEntity(PedidosCotizaciones existingEntity, PedidosCotizaciones incomingEntity)
    {
        existingEntity.IdPedidoCompra = incomingEntity.IdPedidoCompra;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.NumeroPedido = incomingEntity.NumeroPedido;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    private IQueryable<PedidosCotizaciones> BuildQuery()
    {
        return _context.PedidosCotizaciones
            .Include(pedido => pedido.IdPedidoCompraNavigation)
            .Include(pedido => pedido.IdEstadoNavigation);
    }
}
