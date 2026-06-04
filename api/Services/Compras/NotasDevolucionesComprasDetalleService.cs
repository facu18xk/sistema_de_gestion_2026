using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasDevolucionesComprasDetalleService : CrudServiceBase<NotasDevolucionesComprasDetalle, int>
{
    private readonly DblosAmigosContext _context;

    public NotasDevolucionesComprasDetalleService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasDevolucionesComprasDetalle> Set => _context.NotasDevolucionesComprasDetalles;

    protected override IQueryable<NotasDevolucionesComprasDetalle> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasDevolucionesComprasDetalle> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasDevolucionesComprasDetalle, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaDevolucionCompraDetalle == id;
    }

    protected override void UpdateEntity(NotasDevolucionesComprasDetalle existingEntity, NotasDevolucionesComprasDetalle incomingEntity)
    {
        existingEntity.IdNotaDevolucionCompra = incomingEntity.IdNotaDevolucionCompra;
        existingEntity.IdProducto = incomingEntity.IdProducto;
        existingEntity.Cantidad = incomingEntity.Cantidad;
        existingEntity.PrecioUnitario = incomingEntity.PrecioUnitario;
        existingEntity.Subtotal = incomingEntity.Subtotal;
    }

    private IQueryable<NotasDevolucionesComprasDetalle> BuildQuery()
    {
        return _context.NotasDevolucionesComprasDetalles
            .Include(d => d.IdNotaDevolucionCompraNavigation)
            .Include(d => d.IdProductoNavigation);
    }
}