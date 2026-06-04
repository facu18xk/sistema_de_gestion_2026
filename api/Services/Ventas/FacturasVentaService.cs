using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasVentaService : CrudServiceBase<FacturasVenta, int>
{
    private readonly DblosAmigosContext _context;
    private readonly TimbradoNumberingService _timbradoNumberingService;

    public FacturasVentaService(DblosAmigosContext context, TimbradoNumberingService timbradoNumberingService)
        : base(context)
    {
        _context = context;
        _timbradoNumberingService = timbradoNumberingService;
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

    public override async Task<FacturasVenta> CreateAsync(FacturasVenta entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        await _timbradoNumberingService.ApplyNextFacturaVentaNumberAsync(entity);
        _context.FacturasVentas.Add(entity);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return entity;
    }

    protected override void UpdateEntity(FacturasVenta existingEntity, FacturasVenta incomingEntity)
    {
        existingEntity.IdPresupuesto = incomingEntity.IdPresupuesto;
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.IdMedioPagoCompra = incomingEntity.IdMedioPagoCompra;
        existingEntity.FechaPago = incomingEntity.FechaPago;
    }

    private IQueryable<FacturasVenta> BuildQuery()
    {
        return _context.FacturasVentas
            .Include(entity => entity.IdPresupuestoNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation);
    }
}
