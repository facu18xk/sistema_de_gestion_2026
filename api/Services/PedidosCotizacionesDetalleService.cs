using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PedidosCotizacionesDetalleService : CrudServiceBase<PedidosCotizacionesDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public PedidosCotizacionesDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<PedidosCotizacionesDetalle> Set => _context.PedidosCotizacionesDetalles;

    protected override IQueryable<PedidosCotizacionesDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<PedidosCotizacionesDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<PedidosCotizacionesDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPedidoCotizacionDetalle == id;
    }

    protected override void UpdateEntity(PedidosCotizacionesDetalle existingEntity, PedidosCotizacionesDetalle incomingEntity)
    {
        existingEntity.IdPedidoCotizacion = incomingEntity.IdPedidoCotizacion;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Categoria = incomingEntity.Categoria;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioProducto = incomingEntity.PrecioProducto;
    }

    private IQueryable<PedidosCotizacionesDetalle> BuildQuery()
    {
        return _context.PedidosCotizacionesDetalles
            .Include(entity => entity.IdPedidoCotizacionNavigation)
            .Include(entity => entity.IdProductoNavigation);
    }
}
