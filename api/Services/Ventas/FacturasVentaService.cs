using System.Linq.Expressions;
using api.Dtos.Ventas;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class FacturasVentaService : CrudServiceBase<FacturasVenta, int>
{
    private const int EstadoEmitido = 7;
    private const int EstadoAnulado = 8;
    private const int EstadoFacturado = 9;
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

        entity.IdEstado = NormalizeEstado(entity.IdEstado);
        await _timbradoNumberingService.ApplyNextFacturaVentaNumberAsync(entity);
        _context.FacturasVentas.Add(entity);
        await _context.SaveChangesAsync();

        if (entity.IdEstado == EstadoEmitido)
        {
            await MarkPresupuestoFacturadoAsync(entity.IdPresupuesto);
        }

        await transaction.CommitAsync();

        return entity;
    }

    public override async Task<FacturasVenta> UpdateAsync(int id, FacturasVenta entity)
    {
        var existingEntity = await _context.FacturasVentas
            .Include(factura => factura.FacturasVentasDetalles)
            .FirstOrDefaultAsync(factura => factura.IdFacturaVenta == id);

        if (existingEntity is null)
        {
            throw new KeyNotFoundException($"No existe el registro con ID {id}");
        }

        var previousEstado = existingEntity.IdEstado;
        await using var transaction = await _context.Database.BeginTransactionAsync();

        UpdateEntity(existingEntity, entity);

        if (previousEstado != EstadoAnulado && existingEntity.IdEstado == EstadoAnulado)
        {
            var hasNotasCredito = await _context.NotasCreditosVentas
                .AnyAsync(notaCredito => notaCredito.IdFacturaVenta == id);

            if (hasNotasCredito)
            {
                throw new InvalidOperationException("No se puede anular la factura porque tiene notas de crédito asociadas.");
            }

            var stockToRestore = existingEntity.FacturasVentasDetalles
                .Select(detalle => new VentaItemCreateDto
                {
                    IdProducto = detalle.IdProducto,
                    Cantidad = detalle.Cantidad - detalle.CantidadDevuelta
                })
                .Where(item => item.Cantidad > 0)
                .ToArray();

            if (stockToRestore.Length > 0)
            {
                await IncreaseStockAsync(stockToRestore);
            }
        }

        if (previousEstado != EstadoEmitido && existingEntity.IdEstado == EstadoEmitido)
        {
            var stockToDecrease = existingEntity.FacturasVentasDetalles
                .Select(detalle => new VentaItemCreateDto
                {
                    IdProducto = detalle.IdProducto,
                    Cantidad = detalle.Cantidad - detalle.CantidadDevuelta
                })
                .Where(item => item.Cantidad > 0)
                .ToArray();

            if (stockToDecrease.Length > 0)
            {
                await DecreaseStockAsync(stockToDecrease);
            }

            await MarkPresupuestoFacturadoAsync(existingEntity.IdPresupuesto);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return existingEntity;
    }

    protected override void UpdateEntity(FacturasVenta existingEntity, FacturasVenta incomingEntity)
    {
        existingEntity.IdPresupuesto = incomingEntity.IdPresupuesto;
        existingEntity.IdCliente = incomingEntity.IdCliente;
        existingEntity.NroComprobante = string.IsNullOrWhiteSpace(incomingEntity.NroComprobante)
            ? existingEntity.NroComprobante
            : incomingEntity.NroComprobante.Trim();
        existingEntity.IdEstado = NormalizeEstado(incomingEntity.IdEstado);
        if (incomingEntity.IdTimbrado > 0)
        {
            existingEntity.IdTimbrado = incomingEntity.IdTimbrado;
        }
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
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation);
    }

    private async Task MarkPresupuestoFacturadoAsync(int idPresupuesto)
    {
        var presupuesto = await _context.Presupuestos.FindAsync(idPresupuesto);
        if (presupuesto is not null)
        {
            presupuesto.IdEstado = EstadoFacturado;
        }
    }

    private static int NormalizeEstado(int idEstado)
    {
        return idEstado == 0 ? EstadoEmitido : idEstado;
    }

    private async Task DecreaseStockAsync(IReadOnlyCollection<VentaItemCreateDto> items)
    {
        var requestedByProduct = items
            .GroupBy(item => item.IdProducto)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Cantidad));

        foreach (var (idProducto, requestedQuantity) in requestedByProduct)
        {
            var remaining = requestedQuantity;
            var stocks = await _context.StocksDepositos
                .Where(stock => stock.IdProducto == idProducto && stock.Cantidad > 0)
                .OrderBy(stock => stock.IdDeposito)
                .ToListAsync();

            foreach (var stock in stocks)
            {
                if (remaining == 0)
                {
                    break;
                }

                var quantityToTake = Math.Min(stock.Cantidad, remaining);
                stock.Cantidad -= quantityToTake;
                remaining -= quantityToTake;
            }

            if (remaining > 0)
            {
                throw new InvalidOperationException($"Stock insuficiente para el producto {idProducto}.");
            }
        }
    }

    private async Task IncreaseStockAsync(IReadOnlyCollection<VentaItemCreateDto> items)
    {
        var requestedByProduct = items
            .GroupBy(item => item.IdProducto)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Cantidad));

        foreach (var (idProducto, quantity) in requestedByProduct)
        {
            var stock = await _context.StocksDepositos
                .Where(item => item.IdProducto == idProducto)
                .OrderBy(item => item.IdDeposito)
                .FirstOrDefaultAsync();

            if (stock is null)
            {
                var idDeposito = await _context.Depositos
                    .OrderBy(item => item.IdDeposito)
                    .Select(item => (int?)item.IdDeposito)
                    .FirstOrDefaultAsync();

                if (idDeposito is null)
                {
                    throw new InvalidOperationException("No existe un deposito para reponer stock.");
                }

                stock = new StocksDeposito
                {
                    IdDeposito = idDeposito.Value,
                    IdProducto = idProducto,
                    Cantidad = 0
                };
                _context.StocksDepositos.Add(stock);
            }

            stock.Cantidad += quantity;
        }
    }
}
