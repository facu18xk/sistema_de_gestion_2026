using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasVentaService : CrudServiceBase<FacturasVenta, int>
{
    private readonly DblosAmigosContext _context;
<<<<<<< HEAD
    private readonly TimbradoNumberingService _timbradoNumberingService;

    public FacturasVentaService(DblosAmigosContext context, TimbradoNumberingService timbradoNumberingService)
        : base(context)
    {
        _context = context;
        _timbradoNumberingService = timbradoNumberingService;
=======

    public FacturasVentaService(DblosAmigosContext context)
        : base(context)
    {
        _context = context;
>>>>>>> front
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

<<<<<<< HEAD
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
=======
    protected override void UpdateEntity(FacturasVenta existingEntity, FacturasVenta incomingEntity)
    {
        existingEntity.IdOrdenVenta = incomingEntity.IdOrdenVenta;
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.NroComprobante = incomingEntity.NroComprobante;
        existingEntity.IdTimbrado = incomingEntity.IdTimbrado;
>>>>>>> front
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
        existingEntity.IdMedioPagoCompra = incomingEntity.IdMedioPagoCompra;
        existingEntity.FechaPago = incomingEntity.FechaPago;
    }

    private IQueryable<FacturasVenta> BuildQuery()
    {
        return _context.FacturasVentas
<<<<<<< HEAD
            .Include(entity => entity.IdPresupuestoNavigation)
=======
            .Include(entity => entity.IdOrdenVentaNavigation)
>>>>>>> front
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation);
    }
}
