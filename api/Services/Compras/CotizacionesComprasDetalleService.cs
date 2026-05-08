using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CotizacionesComprasDetalleService : CrudServiceBase<CotizacionesComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public CotizacionesComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<CotizacionesComprasDetalle> Set => _context.CotizacionesComprasDetalles;

    protected override IQueryable<CotizacionesComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<CotizacionesComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<CotizacionesComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdCotizacionCompraDetalle == id;
    }

    protected override void UpdateEntity(CotizacionesComprasDetalle existingEntity, CotizacionesComprasDetalle incomingEntity)
    {
        existingEntity.CotizacionCompraId = incomingEntity.CotizacionCompraId;
        existingEntity.ProductoId = incomingEntity.ProductoId;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Descuento = incomingEntity.Descuento;
    }

    private IQueryable<CotizacionesComprasDetalle> BuildQuery()
    {
        return _context.CotizacionesComprasDetalles
            .Include(entity => entity.CotizacionCompra)
            .Include(entity => entity.Producto);
    }
}
