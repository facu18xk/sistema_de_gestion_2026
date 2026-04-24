using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesCompraService : CrudServiceBase<OrdenesCompra, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesCompra> Set => _context.OrdenesCompras;

    protected override IQueryable<OrdenesCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<OrdenesCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenCompra == id;
    }

    protected override void UpdateEntity(OrdenesCompra existingEntity, OrdenesCompra incomingEntity)
    {
        existingEntity.IdPedidoCotizacion = incomingEntity.IdPedidoCotizacion;
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<OrdenesCompra> BuildQuery()
    {
        return _context.OrdenesCompras
            .Include(orden => orden.IdPedidoCotizacionNavigation)
            .Include(orden => orden.IdProveedorNavigation)
            .Include(orden => orden.IdEstadoNavigation);
    }
}
