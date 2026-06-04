using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class OrdenesVentaService : CrudServiceBase<OrdenesVenta, int>
{
    private readonly DblosAmigosContext _context;

    public OrdenesVentaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<OrdenesVenta> Set => _context.OrdenesVentas;

    protected override IQueryable<OrdenesVenta> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesVenta> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<OrdenesVenta, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenVenta == id;
    }

    protected override void UpdateEntity(OrdenesVenta existingEntity, OrdenesVenta incomingEntity)
    {
        existingEntity.IdPresupuesto = incomingEntity.IdPresupuesto;
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    private IQueryable<OrdenesVenta> BuildQuery()
    {
        return _context.OrdenesVentas
            .Include(entity => entity.IdPresupuestoNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation);
    }
}
