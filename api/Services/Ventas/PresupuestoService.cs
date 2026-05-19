using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class PresupuestoService : CrudServiceBase<Presupuesto, int>
{
    private readonly DblosAmigosContext _context;

    public PresupuestoService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<Presupuesto> Set => _context.Presupuestos;

    protected override IQueryable<Presupuesto> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<Presupuesto> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<Presupuesto, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdPresupuesto == id;
    }

    protected override void UpdateEntity(Presupuesto existingEntity, Presupuesto incomingEntity)
    {
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.FechaVencimiento = incomingEntity.FechaVencimiento;
    }

    private IQueryable<Presupuesto> BuildQuery()
    {
        return _context.Presupuestos
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation);
    }
}
