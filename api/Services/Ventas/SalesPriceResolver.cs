using api.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class SalesPriceResolver
{
    private readonly DblosAmigosContext _context;

    public SalesPriceResolver(DblosAmigosContext context)
    {
        _context = context;
    }

    public async Task<decimal> ResolvePrecioUnitarioAsync(int idProducto, decimal precioUnitario)
    {
        if (precioUnitario > 0)
        {
            return precioUnitario;
        }

        return await GetActivePrecioVentaAsync(idProducto);
    }

    public async Task<decimal> GetActivePrecioVentaAsync(int idProducto)
    {
        var precioVenta = await _context.PreciosVentas
            .Where(precio => precio.IdProducto == idProducto && precio.Activo)
            .Select(precio => (decimal?)precio.PrecioVentaValor)
            .FirstOrDefaultAsync();

        if (precioVenta is null)
        {
            throw new InvalidOperationException($"No existe precio de venta activo para el producto {idProducto}");
        }

        return precioVenta.Value;
    }
}
