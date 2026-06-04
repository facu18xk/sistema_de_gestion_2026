using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class NotasDevolucionesVentaService : CrudServiceBase<NotasDevolucionesVenta, int>
{
    private readonly DblosAmigosContext _context;

    public NotasDevolucionesVentaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<NotasDevolucionesVenta> Set => _context.NotasDevolucionesVentas;

    protected override IQueryable<NotasDevolucionesVenta> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<NotasDevolucionesVenta> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<NotasDevolucionesVenta, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdNotaDevolucionVenta == id;
    }

    protected override void UpdateEntity(NotasDevolucionesVenta existingEntity, NotasDevolucionesVenta incomingEntity)
    {
        existingEntity.IdFacturaVenta = incomingEntity.IdFacturaVenta;
        existingEntity.Motivo = incomingEntity.Motivo;
        existingEntity.Fecha = incomingEntity.Fecha;
    }

    private IQueryable<NotasDevolucionesVenta> BuildQuery()
    {
        return _context.NotasDevolucionesVentas
            .Include(entity => entity.IdFacturaVentaNavigation);
    }
}
