using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AsientoService : CrudServiceBase<Asiento, int>
{
    private readonly DblosAmigosContext _context;

    public AsientoService(DblosAmigosContext context) : base(context)
    {
        _context = context;
    }

    protected override DbSet<Asiento> Set => _context.Asientos;

    protected override IQueryable<Asiento> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Asiento> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<Asiento, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdAsiento == id;
    }

    protected override void UpdateEntity(Asiento existingEntity, Asiento incomingEntity)
    {
        existingEntity.NumeroAsiento = incomingEntity.NumeroAsiento;
        existingEntity.IdPeriodoContable = incomingEntity.IdPeriodoContable;
        existingEntity.IdModulo = incomingEntity.IdModulo;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.Automatico = incomingEntity.Automatico;
        existingEntity.Estado = incomingEntity.Estado;
        existingEntity.ReferenciaOrigen = incomingEntity.ReferenciaOrigen;
        existingEntity.IdOrigen = incomingEntity.IdOrigen;
        existingEntity.CreatedAt = incomingEntity.CreatedAt;
        existingEntity.FechaMayorizacion = incomingEntity.FechaMayorizacion;
    }

    private IQueryable<Asiento> BuildQuery()
    {
        return _context.Asientos
            .Include(asiento => asiento.IdPeriodoContableNavigation)
            .Include(asiento => asiento.IdModuloNavigation);
    }
}
