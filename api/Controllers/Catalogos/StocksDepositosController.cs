using api.Dtos.StocksDepositos;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StocksDepositosController : ControllerBase
{
    private readonly DblosAmigosContext _context;

    public StocksDepositosController(DblosAmigosContext context)
    {
        _context = context;
    }

    [HttpGet("{idDeposito:int}/{idProducto:int}")]
    public async Task<ActionResult<StockDepositoDto>> GetStock(int idDeposito, int idProducto)
    {
        var stock = await _context.StocksDepositos
            .AsNoTracking()
            .Include(s => s.IdDepositoNavigation)
            .Include(s => s.IdProductoNavigation)
            .FirstOrDefaultAsync(s => s.IdDeposito == idDeposito && s.IdProducto == idProducto);

        if (stock is null)
        {
            return NotFound();
        }

        return Ok(new StockDepositoDto
        {
            IdDeposito = stock.IdDeposito,
            IdProducto = stock.IdProducto,
            Cantidad = stock.Cantidad,
            Deposito = stock.IdDepositoNavigation?.Nombre ?? string.Empty,
            Producto = stock.IdProductoNavigation?.Descripcion ?? string.Empty
        });
    }
}
