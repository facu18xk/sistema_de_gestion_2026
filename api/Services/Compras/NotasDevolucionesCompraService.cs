using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasDevolucionesCompraService : CrudServiceBase<NotasDevolucionesCompra, int>
{
    private readonly DblosAmigosContext _context;

    public NotasDevolucionesCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasDevolucionesCompra> Set => _context.NotasDevolucionesCompras;

    protected override IQueryable<NotasDevolucionesCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasDevolucionesCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasDevolucionesCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaDevolucionCompra == id;
    }

    protected override void UpdateEntity(NotasDevolucionesCompra existingEntity, NotasDevolucionesCompra incomingEntity)
    {
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    private IQueryable<NotasDevolucionesCompra> BuildQuery()
    {
        return _context.NotasDevolucionesCompras
            .Include(n => n.IdFacturaCompraNavigation)
            .Include(n => n.IdEstadoNavigation)
            .Include(n => n.NotasDevolucionesComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}