using System.Linq.Expressions;
using api.Models;
using Microsoft.EntityFrameworkCore;
using api.Dtos.Contabilidad; 
using api.Dtos.AsientosDetalles; 
using api.Dtos.Asientos; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace api.Services;

public class OrdenesPagosCompraService : CrudServiceBase<OrdenesPagosCompra, int>
{
    private readonly DblosAmigosContext _context;
    private readonly IAsientoContableService _asientoContableService;

    public OrdenesPagosCompraService(
        DblosAmigosContext context,
        IAsientoContableService asientoContableService)
        : base(context)
    {
        _context = context;
        _asientoContableService = asientoContableService;
    }

    protected override DbSet<OrdenesPagosCompra> Set => _context.OrdenesPagosCompras;

    protected override IQueryable<OrdenesPagosCompra> BuildReadQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override IQueryable<OrdenesPagosCompra> BuildGetByIdQuery()
    {
        return BuildQuery().AsNoTracking();
    }

    protected override Expression<Func<OrdenesPagosCompra, bool>> BuildKeyPredicate(int id)
    {
        return entity => entity.IdOrdenPagoCompra == id;
    }

    protected override void UpdateEntity(OrdenesPagosCompra existingEntity, OrdenesPagosCompra incomingEntity)
    {
        existingEntity.IdProveedor = incomingEntity.IdProveedor;
        existingEntity.IdEstado = incomingEntity.IdEstado;
        existingEntity.Fecha = incomingEntity.Fecha;
        existingEntity.Descripcion = incomingEntity.Descripcion;
    }

    public override async Task<OrdenesPagosCompra> CreateAsync(OrdenesPagosCompra entity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var nuevaOrdenPago = await base.CreateAsync(entity);

            if (entity.OrdenesPagosComprasDetalles != null && entity.OrdenesPagosComprasDetalles.Any())
            {
                var detallesAsiento = new List<AsientosDetalleUpsertDto>();
                decimal montoTotalPago = entity.OrdenesPagosComprasDetalles.Sum(d => d.Monto);

                //DEBE: Disminuye la deuda con el proveedor 
                detallesAsiento.Add(new AsientosDetalleUpsertDto
                {
                    IdCuentaContable = 11, 
                    Item = 1,
                    TipoMovimiento = "Debe", 
                    Monto = montoTotalPago,
                    DescripcionItem = $"Pago a proveedor s/ Orden Pago Nro: {nuevaOrdenPago.IdOrdenPagoCompra}"
                });

                //HABER: Salida de dinero por cada cuenta bancaria utilizada
                int itemIndex = 2;
                foreach (var detallePago in entity.OrdenesPagosComprasDetalles)
                {
                    var cuentaBancaria = await _context.CuentasBancarias.FindAsync(detallePago.IdCuentaBancaria);

                    int cuentaContableHaber = cuentaBancaria?.IdCuentaContable ?? 7;

                    detallesAsiento.Add(new AsientosDetalleUpsertDto
                    {
                        IdCuentaContable = cuentaContableHaber, 
                        Item = itemIndex++,
                        TipoMovimiento = "Haber", 
                        Monto = detallePago.Monto,
                        DescripcionItem = $"Salida de fondos s/ Factura ID {detallePago.IdFacturaCompra}"
                    });
                }

                var asientoDto = new AsientoCompletoUpsertDto
                {
                    IdModulo = 1,
                    Fecha = DateOnly.FromDateTime(nuevaOrdenPago.Fecha),
                    Descripcion = string.IsNullOrWhiteSpace(nuevaOrdenPago.Descripcion) 
                        ? $"Orden de Pago a Proveedor Nro: {nuevaOrdenPago.IdOrdenPagoCompra}" 
                        : nuevaOrdenPago.Descripcion,
                    Automatico = true,
                    Estado = "Registrado",
                    ReferenciaOrigen = "Ordenes_Pagos_Compras",
                    IdOrigen = nuevaOrdenPago.IdOrdenPagoCompra,
                    Detalles = detallesAsiento
                };

                await _asientoContableService.CreateManualAsync(asientoDto);
            }

            await transaction.CommitAsync();
            return nuevaOrdenPago;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private IQueryable<OrdenesPagosCompra> BuildQuery()
    {
        return _context.OrdenesPagosCompras
            .Include(ordenPago => ordenPago.IdProveedorNavigation)
            .Include(ordenPago => ordenPago.IdEstadoNavigation)
            .Include(ordenPago => ordenPago.OrdenesPagosComprasDetalles)
                .ThenInclude(d => d.IdFacturaCompraNavigation)
            .Include(ordenPago => ordenPago.OrdenesPagosComprasDetalles)
                .ThenInclude(d => d.IdCuentaBancariaNavigation)
            .Include(ordenPago => ordenPago.OrdenesPagosComprasDetalles)
                .ThenInclude(d => d.IdMedioPagoCompraNavigation);
    }
}