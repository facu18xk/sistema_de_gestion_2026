using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasCreditosCompraService : CrudServiceBase<NotasCreditosCompra, int>
{
    private readonly DblosAmigosContext _context;

    public NotasCreditosCompraService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasCreditosCompra> Set => _context.NotasCreditosCompras;

    protected override IQueryable<NotasCreditosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasCreditosCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasCreditosCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaCreditoCompra == id;
    }

    protected override void UpdateEntity(NotasCreditosCompra existingEntity, NotasCreditosCompra incomingEntity)
    {
        existingEntity.IdFacturaCompra = incomingEntity.IdFacturaCompra;
        existingEntity.IdNotaDevolucionCompra = incomingEntity.IdNotaDevolucionCompra;
        existingEntity.Timbrado = incomingEntity.Timbrado;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Total = incomingEntity.Total;
    }

    private IQueryable<NotasCreditosCompra> BuildQuery()
    {
        return _context.NotasCreditosCompras
            .Include(n => n.IdFacturaCompraNavigation)
            .Include(n => n.IdNotaDevolucionCompraNavigation)
            .Include(n => n.NotasCreditosComprasDetalles)
                .ThenInclude(d => d.IdProductoNavigation);
    }
}