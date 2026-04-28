using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class CotizacionesCompraService : CrudServiceBase<CotizacionesCompra, int>
{
    private readonly DblosAmigosContext _context;

    public CotizacionesCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<CotizacionesCompra> Set => _context.CotizacionesCompras;

    protected override IQueryable<CotizacionesCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<CotizacionesCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<CotizacionesCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdCotizacionCompra == id;
    }

    protected override void UpdateEntity(CotizacionesCompra existingEntity, CotizacionesCompra incomingEntity)
    {
        existingEntity.SolicitudCotizacionId = incomingEntity.SolicitudCotizacionId;
        existingEntity.ProveedorId = incomingEntity.ProveedorId;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.ValidaHasta = incomingEntity.ValidaHasta;
        existingEntity.IdEstado = incomingEntity.IdEstado;
    }

    private IQueryable<CotizacionesCompra> BuildQuery()
    {
        return _context.CotizacionesCompras
            .Include(entity => entity.SolicitudCotizacion)
            .Include(entity => entity.Proveedor)
            .Include(entity => entity.IdEstadoNavigation);
    }
}
