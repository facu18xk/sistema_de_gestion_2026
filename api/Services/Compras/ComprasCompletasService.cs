using api.Dtos.PedidosCompras;
using api.Dtos.PedidosComprasDetalles;
using api.Dtos.PedidosCotizaciones;
using api.Dtos.PedidosCotizacionesDetalles;
using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class ComprasCompletasService
{
    private readonly DblosAmigosContext _context;

    public ComprasCompletasService(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<PedidosCompra> CreatePedidoCompraAsync(PedidosCompraCompletoCreateDto dto)
    {
        var detalles = dto.Detalles ?? Array.Empty<PedidosComprasDetalleCompletoCreateDto>();
        await ValidatePedidoCompraDetallesAsync(detalles);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var pedido = new PedidosCompra
        {
            IdEstado = dto.IdEstado,
            NumeroPedido = dto.NumeroPedido,
            Fecha = dto.Fecha
        };

        _context.PedidosCompras.Add(pedido);
        await _context.SaveChangesAsync();

        foreach (var detalle in detalles)
        {
            _context.PedidosComprasDetalles.Add(new PedidosComprasDetalle
            {
                IdPedidoCompra = pedido.IdPedidoCompra,
                IdProducto = detalle.IdProducto,
                IdCategoria = detalle.IdCategoria,
                Descripcion = string.IsNullOrWhiteSpace(detalle.Descripcion)
                    ? "Sin descripcion"
                    : detalle.Descripcion,
                Cantidad = detalle.Cantidad
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetPedidoCompraAsync(pedido.IdPedidoCompra) ?? pedido;
    }

    public async Task<PedidosCotizaciones> CreatePedidoCotizacionAsync(PedidosCotizacionesCompletoCreateDto dto)
    {
        var detalles = dto.Detalles ?? Array.Empty<PedidosCotizacionesDetalleCompletoCreateDto>();
        await ValidatePedidoCotizacionDetallesAsync(detalles);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var cotizacion = new PedidosCotizaciones
        {
            IdPedidoCompra = dto.IdPedidoCompra,
            IdEstado = dto.IdEstado,
            IdProveedor = dto.IdProveedor,
            NumeroPedido = dto.NumeroPedido,
            Fecha = dto.Fecha
        };

        _context.PedidosCotizaciones.Add(cotizacion);
        await _context.SaveChangesAsync();

        foreach (var detalle in detalles)
        {
            _context.PedidosCotizacionesDetalles.Add(new PedidosCotizacionesDetalle
            {
                IdPedidoCotizacion = cotizacion.IdPedidoCotizacion,
                IdProducto = detalle.IdProducto,
                IdCategoria = detalle.IdCategoria,
                Descripcion = string.IsNullOrWhiteSpace(detalle.Descripcion)
                    ? "Sin descripcion"
                    : detalle.Descripcion,
                Cantidad = detalle.Cantidad,
                PrecioProducto = detalle.PrecioProducto,
                Descuento = detalle.Descuento
            });
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return await GetPedidoCotizacionAsync(cotizacion.IdPedidoCotizacion) ?? cotizacion;
    }

    private async Task ValidatePedidoCompraDetallesAsync(
        IReadOnlyCollection<PedidosComprasDetalleCompletoCreateDto> detalles)
    {
        if (detalles.Count == 0)
        {
            throw new InvalidOperationException("Debe agregar al menos un producto al pedido.");
        }

        if (detalles.Any(detalle => detalle.Cantidad <= 0))
        {
            throw new InvalidOperationException("La cantidad de cada producto debe ser mayor a cero.");
        }

        var productIds = detalles.Select(detalle => detalle.IdProducto).Distinct().ToArray();
        var categoryIds = detalles.Select(detalle => detalle.IdCategoria).Distinct().ToArray();

        var existingProductIds = await _context.Productos
            .Where(producto => productIds.Contains(producto.IdProducto))
            .Select(producto => producto.IdProducto)
            .ToArrayAsync();

        var missingProductIds = productIds.Except(existingProductIds).ToArray();
        if (missingProductIds.Length > 0)
        {
            throw new InvalidOperationException(
                $"No existen los productos indicados: {string.Join(", ", missingProductIds)}.");
        }

        var existingCategoryIds = await _context.Categorias
            .Where(categoria => categoryIds.Contains(categoria.IdCategoria))
            .Select(categoria => categoria.IdCategoria)
            .ToArrayAsync();

        var missingCategoryIds = categoryIds.Except(existingCategoryIds).ToArray();
        if (missingCategoryIds.Length > 0)
        {
            throw new InvalidOperationException(
                $"No existen las categorias indicadas: {string.Join(", ", missingCategoryIds)}.");
        }
    }

    private async Task ValidatePedidoCotizacionDetallesAsync(
        IReadOnlyCollection<PedidosCotizacionesDetalleCompletoCreateDto> detalles)
    {
        if (detalles.Count == 0)
        {
            throw new InvalidOperationException("Debe agregar al menos un producto a la cotizacion.");
        }

        if (detalles.Any(detalle => detalle.Cantidad <= 0))
        {
            throw new InvalidOperationException("La cantidad de cada producto debe ser mayor a cero.");
        }

        var productIds = detalles.Select(detalle => detalle.IdProducto).Distinct().ToArray();
        var categoryIds = detalles.Select(detalle => detalle.IdCategoria).Distinct().ToArray();

        var existingProductIds = await _context.Productos
            .Where(producto => productIds.Contains(producto.IdProducto))
            .Select(producto => producto.IdProducto)
            .ToArrayAsync();

        var missingProductIds = productIds.Except(existingProductIds).ToArray();
        if (missingProductIds.Length > 0)
        {
            throw new InvalidOperationException(
                $"No existen los productos indicados: {string.Join(", ", missingProductIds)}.");
        }

        var existingCategoryIds = await _context.Categorias
            .Where(categoria => categoryIds.Contains(categoria.IdCategoria))
            .Select(categoria => categoria.IdCategoria)
            .ToArrayAsync();

        var missingCategoryIds = categoryIds.Except(existingCategoryIds).ToArray();
        if (missingCategoryIds.Length > 0)
        {
            throw new InvalidOperationException(
                $"No existen las categorias indicadas: {string.Join(", ", missingCategoryIds)}.");
        }
    }

    private async Task<PedidosCompra?> GetPedidoCompraAsync(int idPedidoCompra)
    {
        return await _context.PedidosCompras
            .Include(pedido => pedido.IdEstadoNavigation)
            .AsNoTracking()
            .FirstOrDefaultAsync(pedido => pedido.IdPedidoCompra == idPedidoCompra);
    }

    private async Task<PedidosCotizaciones?> GetPedidoCotizacionAsync(int idPedidoCotizacion)
    {
        return await _context.PedidosCotizaciones
            .Include(cotizacion => cotizacion.IdPedidoCompraNavigation)
            .Include(cotizacion => cotizacion.IdEstadoNavigation)
            .Include(cotizacion => cotizacion.IdProveedorNavigation)
            .AsNoTracking()
            .FirstOrDefaultAsync(cotizacion => cotizacion.IdPedidoCotizacion == idPedidoCotizacion);
    }
}
