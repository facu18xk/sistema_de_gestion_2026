using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesPagosCompraService : CrudServiceBase<OrdenesPagosCompra, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesPagosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesPagosCompra> Set => _context.OrdenesPagosCompras;

    protected override IQueryable<OrdenesPagosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesPagosCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<OrdenesPagosCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenPagoCompra == id;
    }

    protected override void UpdateEntity(OrdenesPagosCompra existingEntity, OrdenesPagosCompra incomingEntity)
    {
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<OrdenesPagosCompra> BuildQuery()
    {
        return _context.OrdenesPagosCompras
            .Include(ordenPago => ordenPago.IdProveedorNavigation)
            .Include(ordenPago => ordenPago.IdEstadoNavigation);
    }
}
