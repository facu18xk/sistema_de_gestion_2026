using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasCreditosVentaService : CrudServiceBase<NotasCreditosVenta, int>
{
    private readonly DblosAmigosContext _context;

    public NotasCreditosVentaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasCreditosVenta> Set => _context.NotasCreditosVentas;

    protected override IQueryable<NotasCreditosVenta> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasCreditosVenta> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasCreditosVenta, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaCreditoVenta == id;
    }

    protected override void UpdateEntity(NotasCreditosVenta existingEntity, NotasCreditosVenta incomingEntity)
    {
        existingEntity.IdFacturaVenta = incomingEntity.IdFacturaVenta;
        existingEntity.IdNotaDevolucionVenta = incomingEntity.IdNotaDevolucionVenta;
        existingEntity.IdTimbrado = incomingEntity.IdTimbrado;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.FechaEmision = incomingEntity.FechaEmision;
        existingEntity.Total = incomingEntity.Total;
    }

    private IQueryable<NotasCreditosVenta> BuildQuery()
    {
        return _context.NotasCreditosVentas
            .Include(entity => entity.IdFacturaVentaNavigation)
            .Include(entity => entity.IdNotaDevolucionVentaNavigation)
            .Include(entity => entity.IdTimbradoNavigation);
    }
}
