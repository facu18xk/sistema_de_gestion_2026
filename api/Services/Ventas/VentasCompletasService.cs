using api.Dtos.AsientosDetalles;
using api.Dtos.Contabilidad;
using api.Dtos.Ventas;
using api.Dtos.Common;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class VentasCompletasService
{
    private const int EstadoEmitido = 7;
    private const int EstadoAnulado = 8;
    private const int EstadoFacturado = 9;
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;
    private readonly TimbradoNumberingService _timbradoNumberingService;
    private readonly IAsientoContableService _asientoContableService;

    public VentasCompletasService(
        DblosAmigosContext context,
        SalesPriceResolver salesPriceResolver,
        TimbradoNumberingService timbradoNumberingService,
        IAsientoContableService asientoContableService)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
        _timbradoNumberingService = timbradoNumberingService;
        _asientoContableService = asientoContableService;
    }

    public async Task<Presupuesto> CreatePresupuestoAsync(PresupuestoCompletoCreateDto dto)
    {
        var products = await ValidateItemsAsync(dto.Items);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var presupuesto = new Presupuesto
        {
            IdCliente = dto.IdCliente,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            FechaVencimiento = dto.FechaVencimiento
        };

        _context.Presupuestos.Add(presupuesto);
        await _context.SaveChangesAsync();

        foreach (var item in dto.Items)
        {
            var producto = products[item.IdProducto];
            var precioUnitario = await _salesPriceResolver.GetActivePrecioVentaAsync(item.IdProducto);
            var totalBruto = CalcularTotalBruto(item.Cantidad, precioUnitario);
            var totalIva = CalcularTotalIva(totalBruto, producto.PorcentajeIva);

            _context.PresupuestosDetalles.Add(new PresupuestosDetalle
            {
                IdPresupuesto = presupuesto.IdPresupuesto,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = precioUnitario,
                Iva = producto.PorcentajeIva,
                Subtotal = totalBruto + totalIva
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetPresupuestoAsync(presupuesto.IdPresupuesto) ?? presupuesto;
    }

    public async Task<PresupuestoCompletoDto> UpdatePresupuestoAsync(int id, PresupuestoCompletoCreateDto dto)
    {
        var presupuesto = await _context.Presupuestos
            .Include(entity => entity.PresupuestosDetalles)
            .FirstOrDefaultAsync(entity => entity.IdPresupuesto == id);

        if (presupuesto is null)
        {
            throw new KeyNotFoundException($"No existe el presupuesto {id}.");
        }

        var products = await ValidateItemsAsync(dto.Items);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        presupuesto.IdCliente = dto.IdCliente;
        presupuesto.IdEstado = dto.IdEstado;
        presupuesto.Fecha = dto.Fecha;
        presupuesto.Descripcion = dto.Descripcion;
        presupuesto.FechaVencimiento = dto.FechaVencimiento;

        _context.PresupuestosDetalles.RemoveRange(presupuesto.PresupuestosDetalles);

        foreach (var item in dto.Items)
        {
            var producto = products[item.IdProducto];
            var precioUnitario = await _salesPriceResolver.GetActivePrecioVentaAsync(item.IdProducto);
            var totalBruto = CalcularTotalBruto(item.Cantidad, precioUnitario);
            var totalIva = CalcularTotalIva(totalBruto, producto.PorcentajeIva);

            _context.PresupuestosDetalles.Add(new PresupuestosDetalle
            {
                IdPresupuesto = presupuesto.IdPresupuesto,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = precioUnitario,
                Iva = producto.PorcentajeIva,
                Subtotal = totalBruto + totalIva
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        var updatedPresupuesto = await GetPresupuestoAsync(id);
        return updatedPresupuesto is null
            ? throw new KeyNotFoundException($"No existe el presupuesto {id}.")
            : ToPresupuestoCompletoDto(updatedPresupuesto);
    }

    public async Task DeletePresupuestoCompletoAsync(int id)
    {
        var presupuesto = await _context.Presupuestos
            .Include(entity => entity.PresupuestosDetalles)
            .FirstOrDefaultAsync(entity => entity.IdPresupuesto == id);

        if (presupuesto is null)
        {
            throw new KeyNotFoundException($"No existe el presupuesto {id}.");
        }

        var hasOrdenVenta = await _context.OrdenesVentas
            .AnyAsync(ordenVenta => ordenVenta.IdPresupuesto == id);

        if (hasOrdenVenta)
        {
            throw new InvalidOperationException("No se puede eliminar el presupuesto porque está asociado a una orden de venta.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        _context.PresupuestosDetalles.RemoveRange(presupuesto.PresupuestosDetalles);
        _context.Presupuestos.Remove(presupuesto);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }

    public async Task<PagedResultDto<PresupuestoCompletoDto>> GetPresupuestosCompletosAsync(PaginationQueryDto pagination)
    {
        var page = pagination.GetNormalizedPage();
        var pageSize = pagination.GetNormalizedPageSize();
        var query = BuildTrackedPresupuestosCompletosQuery();
        var totalCount = await query.CountAsync();
        var presupuestos = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        await UpdateEstadosByDatesAsync(presupuestos);

        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResultDto<PresupuestoCompletoDto>
        {
            Items = presupuestos.Select(ToPresupuestoCompletoDto).ToArray(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = page > 1 && totalPages > 0,
            HasNextPage = page < totalPages
        };
    }

    public async Task<PresupuestoCompletoDto?> GetPresupuestoCompletoAsync(int idPresupuesto)
    {
        var presupuesto = await BuildTrackedPresupuestosCompletosQuery()
            .FirstOrDefaultAsync(entity => entity.IdPresupuesto == idPresupuesto);

        if (presupuesto is null)
        {
            return null;
        }

        await UpdateEstadoByDatesAsync(presupuesto);
        return ToPresupuestoCompletoDto(presupuesto);
    }

    public async Task<OrdenesVenta> CreateOrdenVentaAsync(OrdenVentaCompletaCreateDto dto)
    {
        await ValidateItemsAsync(dto.Items);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var ordenVenta = new OrdenesVenta
        {
            IdPresupuesto = dto.IdPresupuesto,
            IdCliente = dto.IdCliente,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };

        _context.OrdenesVentas.Add(ordenVenta);
        await _context.SaveChangesAsync();

        foreach (var item in dto.Items)
        {
            _context.OrdenesVentasDetalles.Add(new OrdenesVentasDetalle
            {
                IdOrdenVenta = ordenVenta.IdOrdenVenta,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = await _salesPriceResolver.GetActivePrecioVentaAsync(item.IdProducto)
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetOrdenVentaAsync(ordenVenta.IdOrdenVenta) ?? ordenVenta;
    }

    public async Task<FacturasVenta> CreateFacturaVentaAsync(FacturaVentaCompletaCreateDto dto)
    {
        var idEstado = NormalizeFacturaVentaEstado(dto.IdEstado);
        var products = await ValidateItemsAsync(dto.Items, validateStock: idEstado == EstadoEmitido);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var facturaVenta = new FacturasVenta
        {
            IdPresupuesto = dto.IdPresupuesto,
            IdCliente = dto.IdCliente,
            NroComprobante = string.Empty,
            IdEstado = idEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            IdMedioPagoCompra = dto.IdMedioPagoCompra,
            FechaPago = dto.FechaPago
        };

        await _timbradoNumberingService.ApplyNextFacturaVentaNumberAsync(facturaVenta);
        _context.FacturasVentas.Add(facturaVenta);
        await _context.SaveChangesAsync();

        foreach (var item in dto.Items)
        {
            var producto = products[item.IdProducto];
            var precioUnitario = await _salesPriceResolver.GetActivePrecioVentaAsync(item.IdProducto);
            var totalBruto = CalcularTotalBruto(item.Cantidad, precioUnitario);
            var totalIva = CalcularTotalIva(totalBruto, producto.PorcentajeIva);

            _context.FacturasVentasDetalles.Add(new FacturasVentasDetalle
            {
                IdFacturaVenta = facturaVenta.IdFacturaVenta,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                CantidadDevuelta = 0,
                PrecioUnitario = precioUnitario,
                TotalBruto = totalBruto,
                TotalIva = totalIva,
                TotalNeto = totalBruto + totalIva
            });
        }

        if (idEstado == EstadoEmitido)
        {
            await DecreaseStockAsync(dto.Items);
            await MarkPresupuestoFacturadoAsync(dto.IdPresupuesto);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        await TryGenerateFacturaVentaAccountingEntryAsync(facturaVenta.IdFacturaVenta);

        return await GetFacturaVentaAsync(facturaVenta.IdFacturaVenta) ?? facturaVenta;
    }

    public async Task<NotasCreditosVenta> CreateNotaCreditoVentaAsync(NotaCreditoVentaCompletaCreateDto dto)
    {
        var idEstado = NormalizeNotaCreditoVentaEstado(dto.IdEstado);
        var facturaVenta = await _context.FacturasVentas
            .Include(entity => entity.FacturasVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == dto.IdFacturaVenta);

        if (facturaVenta is null)
        {
            throw new KeyNotFoundException($"No existe la factura de venta {dto.IdFacturaVenta}.");
        }

        ValidateNotaCreditoFecha(facturaVenta, dto.FechaEmision);
        ValidateNotaCreditoItems(dto.Items);

        var requestedByProduct = GroupItemsByProduct(dto.Items);

        var facturaByProduct = facturaVenta.FacturasVentasDetalles
            .GroupBy(detalle => detalle.IdProducto)
            .ToDictionary(group => group.Key, group => group.ToList());

        ValidateNotaCreditoDisponible(facturaByProduct, requestedByProduct);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var notaCredito = new NotasCreditosVenta
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdEstado = idEstado,
            IdNotaDevolucionVenta = null,
            NroComprobante = string.Empty,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Total = 0
        };

        await _timbradoNumberingService.ApplyNextNotaCreditoVentaNumberAsync(notaCredito);
        _context.NotasCreditosVentas.Add(notaCredito);
        await _context.SaveChangesAsync();

        decimal total = 0;
        foreach (var item in dto.Items)
        {
            var facturaDetalle = facturaByProduct[item.IdProducto][0];
            var subtotal = CalcularTotalBruto(item.Cantidad, facturaDetalle.PrecioUnitario)
                + CalcularTotalIva(
                    CalcularTotalBruto(item.Cantidad, facturaDetalle.PrecioUnitario),
                    facturaDetalle.IdProductoNavigation.PorcentajeIva);

            _context.NotasCreditosVentasDetalles.Add(new NotasCreditosVentasDetalle
            {
                IdNotaCreditoVenta = notaCredito.IdNotaCreditoVenta,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = facturaDetalle.PrecioUnitario,
                Subtotal = subtotal
            });

            total += subtotal;
        }

        notaCredito.Total = total;

        if (idEstado == EstadoEmitido)
        {
            await ApplyNotaCreditoEmitidaAsync(facturaByProduct, requestedByProduct);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        await TryGenerateNotaCreditoVentaAccountingEntryAsync(notaCredito.IdNotaCreditoVenta);

        return await GetNotaCreditoVentaAsync(notaCredito.IdNotaCreditoVenta) ?? notaCredito;
    }

    public async Task<NotasCreditosVenta> UpdateNotaCreditoVentaAsync(int id, NotaCreditoVentaCompletaUpdateDto dto)
    {
        var idEstado = NormalizeNotaCreditoVentaEstado(dto.IdEstado);
        var notaCredito = await _context.NotasCreditosVentas
            .Include(entity => entity.NotasCreditosVentasDetalles)
            .FirstOrDefaultAsync(entity => entity.IdNotaCreditoVenta == id);

        if (notaCredito is null)
        {
            throw new KeyNotFoundException($"No existe la nota de credito de venta {id}.");
        }

        var previousFacturaVenta = await _context.FacturasVentas
            .Include(entity => entity.FacturasVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == notaCredito.IdFacturaVenta);

        if (previousFacturaVenta is null)
        {
            throw new KeyNotFoundException($"No existe la factura de venta {notaCredito.IdFacturaVenta}.");
        }

        var facturaVenta = notaCredito.IdFacturaVenta == dto.IdFacturaVenta
            ? previousFacturaVenta
            : await _context.FacturasVentas
            .Include(entity => entity.FacturasVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == dto.IdFacturaVenta);

        if (facturaVenta is null)
        {
            throw new KeyNotFoundException($"No existe la factura de venta {dto.IdFacturaVenta}.");
        }

        ValidateNotaCreditoFecha(facturaVenta, dto.FechaEmision);
        ValidateNotaCreditoItems(dto.Items);

        var requestedByProduct = GroupItemsByProduct(dto.Items);

        var facturaByProduct = facturaVenta.FacturasVentasDetalles
            .GroupBy(detalle => detalle.IdProducto)
            .ToDictionary(group => group.Key, group => group.ToList());

        var previousByProduct = notaCredito.NotasCreditosVentasDetalles
            .GroupBy(detalle => detalle.IdProducto)
            .ToDictionary(group => group.Key, group => group.Sum(detalle => detalle.Cantidad));

        await using var transaction = await _context.Database.BeginTransactionAsync();

        if (notaCredito.IdEstado == EstadoEmitido)
        {
            await RevertNotaCreditoEmitidaAsync(previousFacturaVenta.FacturasVentasDetalles, previousByProduct);
        }

        if (idEstado == EstadoEmitido)
        {
            ValidateNotaCreditoDisponible(facturaByProduct, requestedByProduct);
        }

        notaCredito.IdFacturaVenta = dto.IdFacturaVenta;
        notaCredito.IdEstado = idEstado;
        notaCredito.IdNotaDevolucionVenta = null;
        if (!string.IsNullOrWhiteSpace(dto.NroComprobante))
        {
            notaCredito.NroComprobante = dto.NroComprobante.Trim();
            if (dto.IdTimbrado > 0)
            {
                notaCredito.IdTimbrado = dto.IdTimbrado;
            }
        }
        else if (dto.IdTimbrado > 0)
        {
            notaCredito.IdTimbrado = dto.IdTimbrado;
        }
        notaCredito.Motivo = dto.Motivo;
        notaCredito.FechaEmision = dto.FechaEmision;

        _context.NotasCreditosVentasDetalles.RemoveRange(notaCredito.NotasCreditosVentasDetalles);

        decimal total = 0;
        foreach (var item in dto.Items)
        {
            var facturaDetalle = facturaByProduct[item.IdProducto][0];
            var totalBruto = CalcularTotalBruto(item.Cantidad, facturaDetalle.PrecioUnitario);
            var subtotal = totalBruto + CalcularTotalIva(totalBruto, facturaDetalle.IdProductoNavigation.PorcentajeIva);

            _context.NotasCreditosVentasDetalles.Add(new NotasCreditosVentasDetalle
            {
                IdNotaCreditoVenta = notaCredito.IdNotaCreditoVenta,
                IdProducto = item.IdProducto,
                Cantidad = item.Cantidad,
                PrecioUnitario = facturaDetalle.PrecioUnitario,
                Subtotal = subtotal
            });

            total += subtotal;
        }

        notaCredito.Total = total;

        if (idEstado == EstadoEmitido)
        {
            await ApplyNotaCreditoEmitidaAsync(facturaByProduct, requestedByProduct);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        await TryGenerateNotaCreditoVentaAccountingEntryAsync(notaCredito.IdNotaCreditoVenta);

        return await GetNotaCreditoVentaAsync(notaCredito.IdNotaCreditoVenta) ?? notaCredito;
    }

    public async Task<PagedResultDto<FacturaVentaCompletaDto>> GetFacturasVentasCompletasAsync(PaginationQueryDto pagination)
    {
        var page = pagination.GetNormalizedPage();
        var pageSize = pagination.GetNormalizedPageSize();
        var query = BuildFacturasVentasCompletasQuery();
        var totalCount = await query.CountAsync();
        var facturasVentas = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResultDto<FacturaVentaCompletaDto>
        {
            Items = facturasVentas.Select(ToFacturaVentaCompletaDto).ToArray(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = page > 1 && totalPages > 0,
            HasNextPage = page < totalPages
        };
    }

    public async Task<FacturaVentaCompletaDto?> GetFacturaVentaCompletaAsync(int idFacturaVenta)
    {
        var facturaVenta = await BuildFacturasVentasCompletasQuery()
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == idFacturaVenta);

        return facturaVenta is null ? null : ToFacturaVentaCompletaDto(facturaVenta);
    }

    private async Task<Dictionary<int, Producto>> ValidateItemsAsync(
        IReadOnlyCollection<VentaItemCreateDto> items,
        bool validateStock = true)
    {
        if (items.Count == 0)
        {
            throw new InvalidOperationException("Debe enviar al menos un item.");
        }

        var invalidQuantity = items.FirstOrDefault(item => item.Cantidad <= 0);
        if (invalidQuantity is not null)
        {
            throw new InvalidOperationException($"La cantidad del producto {invalidQuantity.IdProducto} debe ser mayor a cero.");
        }

        var productIds = items.Select(item => item.IdProducto).Distinct().ToArray();
        var products = await _context.Productos
            .Where(producto => productIds.Contains(producto.IdProducto))
            .ToDictionaryAsync(producto => producto.IdProducto);

        var missingProductIds = productIds.Where(id => !products.ContainsKey(id)).ToArray();
        if (missingProductIds.Length > 0)
        {
            throw new InvalidOperationException($"No existen los productos: {string.Join(", ", missingProductIds)}.");
        }

        var requestedByProduct = GroupItemsByProduct(items);

        if (validateStock)
        {
            var stockByProduct = await _context.StocksDepositos
                .Where(stock => productIds.Contains(stock.IdProducto))
                .GroupBy(stock => stock.IdProducto)
                .Select(group => new
                {
                    IdProducto = group.Key,
                    Cantidad = group.Sum(stock => stock.Cantidad)
                })
                .ToDictionaryAsync(stock => stock.IdProducto, stock => stock.Cantidad);

            foreach (var (idProducto, requestedQuantity) in requestedByProduct)
            {
                var currentStock = stockByProduct.GetValueOrDefault(idProducto);
                if (currentStock < requestedQuantity)
                {
                    throw new InvalidOperationException(
                        $"Stock insuficiente para el producto {idProducto}. Disponible: {currentStock}, solicitado: {requestedQuantity}.");
                }
            }
        }

        return products;
    }

    private static void ValidateNotaCreditoFecha(FacturasVenta facturaVenta, DateTime fechaEmision)
    {
        if (fechaEmision < facturaVenta.Fecha)
        {
            throw new InvalidOperationException("La fecha de la nota de credito no puede ser anterior a la factura.");
        }

        if (fechaEmision > facturaVenta.Fecha.AddHours(48))
        {
            throw new InvalidOperationException("La devolucion solo puede registrarse dentro de las 48 horas posteriores a la venta.");
        }
    }

    private static void ValidateNotaCreditoItems(IReadOnlyCollection<VentaItemCreateDto> items)
    {
        if (items.Count == 0)
        {
            throw new InvalidOperationException("Debe enviar al menos un item para la nota de credito.");
        }

        var invalidQuantity = items.FirstOrDefault(item => item.Cantidad <= 0);
        if (invalidQuantity is not null)
        {
            throw new InvalidOperationException($"La cantidad del producto {invalidQuantity.IdProducto} debe ser mayor a cero.");
        }
    }

    private static Dictionary<int, int> GroupItemsByProduct(IReadOnlyCollection<VentaItemCreateDto> items)
    {
        return items
            .GroupBy(item => item.IdProducto)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Cantidad));
    }

    private static void ValidateNotaCreditoDisponible(
        IReadOnlyDictionary<int, List<FacturasVentasDetalle>> facturaByProduct,
        IReadOnlyDictionary<int, int> requestedByProduct)
    {
        foreach (var (idProducto, requestedQuantity) in requestedByProduct)
        {
            if (!facturaByProduct.TryGetValue(idProducto, out var facturaDetalles))
            {
                throw new InvalidOperationException($"El producto {idProducto} no pertenece a la factura indicada.");
            }

            var availableQuantity = facturaDetalles.Sum(detalle => detalle.Cantidad - detalle.CantidadDevuelta);

            if (requestedQuantity > availableQuantity)
            {
                throw new InvalidOperationException(
                    $"La cantidad a devolver del producto {idProducto} supera lo facturado pendiente. Disponible: {availableQuantity}, solicitado: {requestedQuantity}.");
            }
        }
    }

    private async Task ApplyNotaCreditoEmitidaAsync(
        IReadOnlyDictionary<int, List<FacturasVentasDetalle>> facturaByProduct,
        IReadOnlyDictionary<int, int> quantitiesByProduct)
    {
        foreach (var (idProducto, quantity) in quantitiesByProduct)
        {
            if (!facturaByProduct.TryGetValue(idProducto, out var detalles))
            {
                throw new InvalidOperationException($"El producto {idProducto} no pertenece a la factura indicada.");
            }

            ApplyCantidadDevuelta(detalles, idProducto, quantity);
        }

        await IncreaseStockAsync(ToVentaItems(quantitiesByProduct));
    }

    private async Task RevertNotaCreditoEmitidaAsync(
        IEnumerable<FacturasVentasDetalle> facturaDetalles,
        IReadOnlyDictionary<int, int> quantitiesByProduct)
    {
        var facturaByProduct = facturaDetalles
            .GroupBy(detalle => detalle.IdProducto)
            .ToDictionary(group => group.Key, group => group.ToList());

        foreach (var (idProducto, quantity) in quantitiesByProduct)
        {
            if (!facturaByProduct.TryGetValue(idProducto, out var detalles))
            {
                throw new InvalidOperationException($"El producto {idProducto} no pertenece a la factura indicada.");
            }

            RevertCantidadDevuelta(detalles, idProducto, quantity);
        }

        await DecreaseStockAsync(ToVentaItems(quantitiesByProduct));
    }

    private static void ApplyCantidadDevuelta(
        IReadOnlyCollection<FacturasVentasDetalle> detalles,
        int idProducto,
        int quantity)
    {
        var remaining = quantity;
        foreach (var detalle in detalles.OrderBy(detalle => detalle.IdFacturaVentaDetalle))
        {
            if (remaining == 0)
            {
                break;
            }

            var available = detalle.Cantidad - detalle.CantidadDevuelta;
            var quantityToApply = Math.Min(available, remaining);
            detalle.CantidadDevuelta += quantityToApply;
            remaining -= quantityToApply;
        }

        if (remaining > 0)
        {
            throw new InvalidOperationException($"La cantidad a devolver del producto {idProducto} supera lo facturado pendiente.");
        }
    }

    private static void RevertCantidadDevuelta(
        IReadOnlyCollection<FacturasVentasDetalle> detalles,
        int idProducto,
        int quantity)
    {
        var remaining = quantity;
        foreach (var detalle in detalles.OrderByDescending(detalle => detalle.IdFacturaVentaDetalle))
        {
            if (remaining == 0)
            {
                break;
            }

            var quantityToRevert = Math.Min(detalle.CantidadDevuelta, remaining);
            detalle.CantidadDevuelta -= quantityToRevert;
            remaining -= quantityToRevert;
        }

        if (remaining > 0)
        {
            throw new InvalidOperationException($"La cantidad devuelta del producto {idProducto} no puede quedar negativa.");
        }
    }

    private static VentaItemCreateDto[] ToVentaItems(IReadOnlyDictionary<int, int> quantitiesByProduct)
    {
        return quantitiesByProduct
            .Where(item => item.Value > 0)
            .Select(item => new VentaItemCreateDto { IdProducto = item.Key, Cantidad = item.Value })
            .ToArray();
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

    private async Task MarkPresupuestoFacturadoAsync(int idPresupuesto)
    {
        var presupuesto = await _context.Presupuestos.FindAsync(idPresupuesto);
        if (presupuesto is not null)
        {
            presupuesto.IdEstado = EstadoFacturado;
        }
    }

    private static int NormalizeFacturaVentaEstado(int idEstado)
    {
        return idEstado == 0 ? EstadoEmitido : idEstado;
    }

    private static int NormalizeNotaCreditoVentaEstado(int idEstado)
    {
        return idEstado == 0 ? EstadoEmitido : idEstado;
    }

    private async Task<Presupuesto?> GetPresupuestoAsync(int id)
    {
        return await BuildPresupuestosCompletosQuery()
            .FirstOrDefaultAsync(entity => entity.IdPresupuesto == id);
    }

    private IQueryable<Presupuesto> BuildPresupuestosCompletosQuery()
    {
        return _context.Presupuestos
            .AsNoTracking()
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.PresupuestosDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation);
    }

    private IQueryable<Presupuesto> BuildTrackedPresupuestosCompletosQuery()
    {
        return _context.Presupuestos
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.PresupuestosDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation);
    }

    private async Task<OrdenesVenta?> GetOrdenVentaAsync(int id)
    {
        return await _context.OrdenesVentas
            .AsNoTracking()
            .Include(entity => entity.IdPresupuestoNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.OrdenesVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdOrdenVenta == id);
    }

    private async Task<FacturasVenta?> GetFacturaVentaAsync(int id)
    {
        return await BuildFacturasVentasCompletasQuery()
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == id);
    }

    private async Task<NotasCreditosVenta?> GetNotaCreditoVentaAsync(int id)
    {
        return await _context.NotasCreditosVentas
            .AsNoTracking()
            .Include(entity => entity.IdFacturaVentaNavigation)
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.IdNotaDevolucionVentaNavigation)
            .Include(entity => entity.IdTimbradoNavigation)
            .Include(entity => entity.NotasCreditosVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdNotaCreditoVenta == id);
    }

    private IQueryable<FacturasVenta> BuildFacturasVentasCompletasQuery()
    {
        return _context.FacturasVentas
            .AsNoTracking()
            .Include(entity => entity.IdPresupuestoNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdEstadoNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation)
            .Include(entity => entity.FacturasVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .Include(entity => entity.NotasCreditosVenta)
                .ThenInclude(nc => nc.NotasCreditosVentasDetalles);
    }

    private static decimal CalcularTotalBruto(int cantidad, decimal precioUnitario)
    {
        return Math.Round(cantidad * precioUnitario, 2, MidpointRounding.AwayFromZero);
    }

    private static decimal CalcularTotalIva(decimal totalBruto, decimal porcentajeIva)
    {
        return IvaCalculator.CalculateTotal(totalBruto, porcentajeIva);
    }

    private static PresupuestoCompletoDto ToPresupuestoCompletoDto(Presupuesto presupuesto)
    {
        return new PresupuestoCompletoDto
        {
            IdPresupuesto = presupuesto.IdPresupuesto,
            IdCliente = presupuesto.IdCliente,
            Cliente = FormatCliente(presupuesto.IdClienteNavigation),
            IdEstado = presupuesto.IdEstado,
            Estado = presupuesto.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = presupuesto.Fecha,
            Descripcion = presupuesto.Descripcion,
            FechaVencimiento = presupuesto.FechaVencimiento,
            Items = presupuesto.PresupuestosDetalles.Select(detalle => new VentaItemDto
            {
                IdProducto = detalle.IdProducto,
                Producto = detalle.IdProductoNavigation?.Descripcion ?? string.Empty,
                Cantidad = detalle.Cantidad,
                PrecioUnitario = detalle.PrecioUnitario,
                PrecioVenta = detalle.PrecioUnitario,
                Iva = detalle.Iva,
                Subtotal = detalle.Subtotal
            }).ToArray()
        };
    }

    private static FacturaVentaCompletaDto ToFacturaVentaCompletaDto(FacturasVenta facturaVenta)
    {
        return new FacturaVentaCompletaDto
        {
            IdFacturaVenta = facturaVenta.IdFacturaVenta,
            IdPresupuesto = facturaVenta.IdPresupuesto,
            PresupuestoDescripcion = facturaVenta.IdPresupuestoNavigation?.Descripcion ?? string.Empty,
            IdCliente = facturaVenta.IdCliente,
            Cliente = FormatCliente(facturaVenta.IdClienteNavigation),
            NroComprobante = facturaVenta.NroComprobante,
            IdEstado = facturaVenta.IdEstado,
            Estado = facturaVenta.IdEstadoNavigation?.Nombre ?? string.Empty,
            IdTimbrado = facturaVenta.IdTimbrado,
            Timbrado = facturaVenta.IdTimbradoNavigation?.NumeroTimbrado ?? string.Empty,
            TimbradoRuc = facturaVenta.IdTimbradoNavigation?.Ruc ?? string.Empty,
            Fecha = facturaVenta.Fecha,
            Descripcion = facturaVenta.Descripcion,
            IdMedioPagoCompra = facturaVenta.IdMedioPagoCompra,
            MedioPagoCompra = facturaVenta.IdMedioPagoCompraNavigation?.Nombre ?? string.Empty,
            FechaPago = facturaVenta.FechaPago,
            Items = facturaVenta.FacturasVentasDetalles.Select(detalle => new FacturaVentaItemDto
            {
                IdProducto = detalle.IdProducto,
                Producto = detalle.IdProductoNavigation?.Descripcion ?? string.Empty,
                Cantidad = detalle.Cantidad,
                CantidadDevuelta = detalle.CantidadDevuelta,
                PrecioUnitario = detalle.PrecioUnitario,
                TotalBruto = detalle.TotalBruto,
                TotalIva = detalle.TotalIva,
                TotalNeto = detalle.TotalNeto
            }).ToArray()
        };
    }

    private async Task TryGenerateFacturaVentaAccountingEntryAsync(int idFacturaVenta)
    {
        var existing = await _context.Asientos
            .AnyAsync(item => item.ReferenciaOrigen == "FacturasVentas" && item.IdOrigen == idFacturaVenta);
        if (existing)
        {
            return;
        }

        var facturaVenta = await _context.FacturasVentas
            .AsNoTracking()
            .Include(entity => entity.FacturasVentasDetalles)
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == idFacturaVenta);
        if (facturaVenta is null)
        {
            return;
        }

        var totalBruto = facturaVenta.FacturasVentasDetalles.Sum(detalle => detalle.TotalBruto);
        var totalIva = facturaVenta.FacturasVentasDetalles.Sum(detalle => detalle.TotalIva);
        var totalNeto = facturaVenta.FacturasVentasDetalles.Sum(detalle => detalle.TotalNeto);

        var cuentas = await GetVentasAccountingAccountsAsync(facturaVenta.Fecha.Year);
        if (cuentas is null)
        {
            return;
        }

        var detalles = new List<AsientosDetalleUpsertDto>
        {
            new()
            {
                IdCuentaContable = cuentas.Caja,
                Item = 1,
                TipoMovimiento = "Debe",
                Monto = totalNeto,
                DescripcionItem = "Cobro de factura de venta"
            },
            new()
            {
                IdCuentaContable = cuentas.VentasMercaderias,
                Item = 2,
                TipoMovimiento = "Haber",
                Monto = totalBruto,
                DescripcionItem = "Venta de mercaderias"
            }
        };

        if (totalIva > 0)
        {
            detalles.Add(new AsientosDetalleUpsertDto
            {
                IdCuentaContable = cuentas.IvaDebitoFiscal,
                Item = 3,
                TipoMovimiento = "Haber",
                Monto = totalIva,
                DescripcionItem = "IVA debito fiscal"
            });
        }

        await _asientoContableService.CreateManualAsync(new AsientoCompletoUpsertDto
        {
            IdModulo = cuentas.IdModuloVentas,
            Fecha = DateOnly.FromDateTime(facturaVenta.Fecha),
            Descripcion = "Factura de venta emitida",
            Automatico = true,
            Estado = ContabilidadEstados.Registrado,
            ReferenciaOrigen = "FacturasVentas",
            IdOrigen = facturaVenta.IdFacturaVenta,
            Detalles = detalles
        });
    }

    private async Task TryGenerateNotaCreditoVentaAccountingEntryAsync(int idNotaCreditoVenta)
    {
        var existingIdAsiento = await _context.Asientos
            .Where(item => item.ReferenciaOrigen == "NotasCreditosVentas" && item.IdOrigen == idNotaCreditoVenta)
            .Select(item => (int?)item.IdAsiento)
            .FirstOrDefaultAsync();

        var notaCredito = await _context.NotasCreditosVentas
            .AsNoTracking()
            .Include(entity => entity.NotasCreditosVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdNotaCreditoVenta == idNotaCreditoVenta);
        if (notaCredito is null)
        {
            return;
        }

        var totalBruto = notaCredito.NotasCreditosVentasDetalles
            .Sum(detalle => CalcularTotalBruto(detalle.Cantidad, detalle.PrecioUnitario));
        var totalIva = notaCredito.NotasCreditosVentasDetalles
            .Sum(detalle => CalcularTotalIva(
                CalcularTotalBruto(detalle.Cantidad, detalle.PrecioUnitario),
                detalle.IdProductoNavigation.PorcentajeIva));

        var cuentas = await GetVentasAccountingAccountsAsync(notaCredito.FechaEmision.Year);
        if (cuentas is null)
        {
            return;
        }

        var detalles = new List<AsientosDetalleUpsertDto>
        {
            new()
            {
                IdCuentaContable = cuentas.VentasMercaderias,
                Item = 1,
                TipoMovimiento = "Debe",
                Monto = totalBruto,
                DescripcionItem = "Devolucion de venta"
            }
        };

        if (totalIva > 0)
        {
            detalles.Add(new AsientosDetalleUpsertDto
            {
                IdCuentaContable = cuentas.IvaDebitoFiscal,
                Item = 2,
                TipoMovimiento = "Debe",
                Monto = totalIva,
                DescripcionItem = "Reversion de IVA debito fiscal"
            });
        }

        detalles.Add(new AsientosDetalleUpsertDto
        {
            IdCuentaContable = cuentas.Caja,
            Item = 3,
            TipoMovimiento = "Haber",
            Monto = notaCredito.Total,
            DescripcionItem = "Credito emitido al cliente"
        });

        var asientoDto = new AsientoCompletoUpsertDto
        {
            IdModulo = cuentas.IdModuloVentas,
            Fecha = DateOnly.FromDateTime(notaCredito.FechaEmision),
            Descripcion = "Nota de credito por devolucion",
            Automatico = true,
            Estado = ContabilidadEstados.Registrado,
            ReferenciaOrigen = "NotasCreditosVentas",
            IdOrigen = notaCredito.IdNotaCreditoVenta,
            Detalles = detalles
        };

        if (existingIdAsiento is null)
        {
            await _asientoContableService.CreateManualAsync(asientoDto);
        }
        else
        {
            await _asientoContableService.UpdateManualAsync(existingIdAsiento.Value, asientoDto);
        }
    }

    private async Task<VentasAccountingAccounts?> GetVentasAccountingAccountsAsync(int year)
    {
        var proceso = await _context.ProcesosContables
            .AsNoTracking()
            .Where(item => item.PeriodoAnho == year)
            .OrderBy(item => item.IdProcesoContable)
            .FirstOrDefaultAsync();
        if (proceso is null)
        {
            return null;
        }

        var idModuloVentas = await _context.Modulos
            .AsNoTracking()
            .Where(item => item.Nombre.ToLower() == "ventas")
            .Select(item => (int?)item.IdModulo)
            .FirstOrDefaultAsync();

        var caja = await FindCuentaIdByNumeroAsync(proceso.IdProcesoContable, "101");
        var ventasMercaderias = await FindCuentaIdByNumeroAsync(proceso.IdProcesoContable, "401");
        var ivaDebitoFiscal = await FindCuentaIdByNumeroAsync(proceso.IdProcesoContable, "202");

        return idModuloVentas is null || caja is null || ventasMercaderias is null || ivaDebitoFiscal is null
            ? null
            : new VentasAccountingAccounts(idModuloVentas.Value, caja.Value, ventasMercaderias.Value, ivaDebitoFiscal.Value);
    }

    private async Task<int?> FindCuentaIdByNumeroAsync(int idProcesoContable, string numeroCuenta)
    {
        return await _context.CuentasContables
            .AsNoTracking()
            .Where(item =>
                item.IdProcesoContable == idProcesoContable &&
                item.EsAsentable &&
                item.Activa &&
                item.NumeroCuenta == numeroCuenta)
            .Select(item => (int?)item.IdCuentaContable)
            .FirstOrDefaultAsync();
    }

    private async Task UpdateEstadosByDatesAsync(IEnumerable<Presupuesto> presupuestos)
    {
        var estadosByName = await GetEstadosByNameAsync();
        var hasChanges = false;

        foreach (var presupuesto in presupuestos)
        {
            hasChanges |= UpdateEstadoByDates(presupuesto, estadosByName);
        }

        if (hasChanges)
        {
            await _context.SaveChangesAsync();
        }
    }

    private async Task UpdateEstadoByDatesAsync(Presupuesto presupuesto)
    {
        var estadosByName = await GetEstadosByNameAsync();
        if (UpdateEstadoByDates(presupuesto, estadosByName))
        {
            await _context.SaveChangesAsync();
        }
    }

    private async Task<Dictionary<string, Estado>> GetEstadosByNameAsync()
    {
        return await _context.Estados
            .ToDictionaryAsync(estado => estado.Nombre, StringComparer.OrdinalIgnoreCase);
    }

    private static bool UpdateEstadoByDates(Presupuesto presupuesto, IReadOnlyDictionary<string, Estado> estadosByName)
    {
        if (!IsExpired(presupuesto.FechaVencimiento)
            || !estadosByName.TryGetValue("Expirado", out var estado)
            || presupuesto.IdEstado == estado.IdEstado)
        {
            return false;
        }

        presupuesto.IdEstado = estado.IdEstado;
        presupuesto.IdEstadoNavigation = estado;
        return true;
    }

    private static bool IsExpired(DateTime fechaVencimiento)
    {
        return DateTime.Today > fechaVencimiento.Date;
    }

    private static string FormatCliente(Cliente? cliente)
    {
        var persona = cliente?.IdPersonaNavigation;
        return persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim();
    }

    private sealed record VentasAccountingAccounts(
        int IdModuloVentas,
        int Caja,
        int VentasMercaderias,
        int IvaDebitoFiscal);
}
