using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasVentaService : CrudServiceBase<FacturasVenta, int>
{
    private readonly DblosAmigosContext _context;

    public FacturasVentaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
    }

    protected override DbSet<FacturasVenta> Set => _context.FacturasVentas;

    protected override IQueryable<FacturasVenta> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<FacturasVenta> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<FacturasVenta, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdFacturaVenta == id;
    }

    protected override void UpdateEntity(FacturasVenta existingEntity, FacturasVenta incomingEntity)
    {
        existingEntity.IdOrdenVenta = incomingEntity.IdOrdenVenta;
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.NroComprobante = incomingEntity.NroComprobante;
        existingEntity.IdTimbrado = incomingEntity.IdTimbrado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.IdMedioPagoCompra = incomingEntity.IdMedioPagoCompra;
        existingEntity.FechaPago = incomingEntity.FechaPago;
    }

    private IQueryable<FacturasVenta> BuildQuery()
    {
        return _context.FacturasVentas
            .Include(entity => entity.IdOrdenVentaNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation);
    }
}
