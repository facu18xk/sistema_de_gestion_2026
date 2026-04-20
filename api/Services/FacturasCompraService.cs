using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasCompraService : CrudServiceBase<FacturasCompra, int>
{
    private readonly DblosAmigosContext _context;

    public FacturasCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<FacturasCompra> Set => _context.FacturasCompras;

    protected override IQueryable<FacturasCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<FacturasCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<FacturasCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdFacturaCompra == id;
    }

    protected override void UpdateEntity(FacturasCompra existingEntity, FacturasCompra incomingEntity)
    {
        existingEntity.IdOrdenCompra = incomingEntity.IdOrdenCompra;
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.NroComprobante = incomingEntity.NroComprobante;
        existingEntity.Timbrado = incomingEntity.Timbrado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<FacturasCompra> BuildQuery()
    {
        return _context.FacturasCompras
            .Include(factura => factura.IdOrdenCompraNavigation)
            .Include(factura => factura.IdProveedorNavigation);
    }
}
