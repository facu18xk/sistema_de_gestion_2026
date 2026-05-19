using api.Dtos.Ventas;
using api.Dtos.Common;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class VentasCompletasService
{
    private readonly DblosAmigosContext _context;
    private readonly SalesPriceResolver _salesPriceResolver;

    public VentasCompletasService(DblosAmigosContext context, SalesPriceResolver salesPriceResolver)
    {
        _context = context;
        _salesPriceResolver = salesPriceResolver;
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
                Iva = totalIva,
                Subtotal = totalBruto + totalIva
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetPresupuestoAsync(presupuesto.IdPresupuesto) ?? presupuesto;
    }

    public async Task<PagedResultDto<PresupuestoCompletoDto>> GetPresupuestosCompletosAsync(PaginationQueryDto pagination)
    {
        var page = pagination.GetNormalizedPage();
        var pageSize = pagination.GetNormalizedPageSize();
        var query = BuildPresupuestosCompletosQuery();
        var totalCount = await query.CountAsync();
        var presupuestos = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
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
        var presupuesto = await BuildPresupuestosCompletosQuery()
            .FirstOrDefaultAsync(entity => entity.IdPresupuesto == idPresupuesto);

        return presupuesto is null ? null : ToPresupuestoCompletoDto(presupuesto);
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
        var products = await ValidateItemsAsync(dto.Items);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var facturaVenta = new FacturasVenta
        {
            IdOrdenVenta = dto.IdOrdenVenta,
            IdCliente = dto.IdCliente,
            NroComprobante = dto.NroComprobante,
            IdTimbrado = dto.IdTimbrado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            IdMedioPagoCompra = dto.IdMedioPagoCompra,
            FechaPago = dto.FechaPago
        };

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
                PrecioUnitario = precioUnitario,
                TotalBruto = totalBruto,
                TotalIva = totalIva,
                TotalNeto = totalBruto + totalIva
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetFacturaVentaAsync(facturaVenta.IdFacturaVenta) ?? facturaVenta;
    }

    private async Task<Dictionary<int, Producto>> ValidateItemsAsync(IReadOnlyCollection<VentaItemCreateDto> items)
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

        var requestedByProduct = items
            .GroupBy(item => item.IdProducto)
            .ToDictionary(group => group.Key, group => group.Sum(item => item.Cantidad));

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

        return products;
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
        return await _context.FacturasVentas
            .AsNoTracking()
            .Include(entity => entity.IdOrdenVentaNavigation)
            .Include(entity => entity.IdClienteNavigation)
                .ThenInclude(cliente => cliente.IdPersonaNavigation)
            .Include(entity => entity.IdMedioPagoCompraNavigation)
            .Include(entity => entity.IdTimbradoNavigation)
            .Include(entity => entity.FacturasVentasDetalles)
                .ThenInclude(detalle => detalle.IdProductoNavigation)
            .FirstOrDefaultAsync(entity => entity.IdFacturaVenta == id);
    }

    private static decimal CalcularTotalBruto(int cantidad, decimal precioUnitario)
    {
        return Math.Round(cantidad * precioUnitario, 2, MidpointRounding.AwayFromZero);
    }

    private static decimal CalcularTotalIva(decimal totalBruto, decimal porcentajeIva)
    {
        return Math.Round(totalBruto * porcentajeIva / 100, 2, MidpointRounding.AwayFromZero);
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
                Iva = detalle.Iva,
                Subtotal = detalle.Subtotal
            }).ToArray()
        };
    }

    private static string FormatCliente(Cliente? cliente)
    {
        var persona = cliente?.IdPersonaNavigation;
        return persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim();
    }
}
