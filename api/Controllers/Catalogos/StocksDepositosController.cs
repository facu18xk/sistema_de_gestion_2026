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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockDepositoDto>>> GetStocks()
    {
        var stocks = await _context.StocksDepositos
            .AsNoTracking()
            .Include(s => s.IdDepositoNavigation)
            .Include(s => s.IdProductoNavigation)
            .OrderBy(s => s.IdDeposito)
            .ThenBy(s => s.IdProducto)
            .ToListAsync();

        return Ok(stocks.Select(ToDto));
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

        return Ok(ToDto(stock));
    }

    [HttpPost]
    public async Task<ActionResult<StockDepositoDto>> CreateStock(StockDepositoUpsertDto dto)
    {
        var exists = await _context.StocksDepositos
            .AnyAsync(s => s.IdDeposito == dto.IdDeposito && s.IdProducto == dto.IdProducto);

        if (exists)
        {
            return Conflict(new { message = "Ya existe stock para este depósito y producto. Use PUT para actualizarlo." });
        }

        if (!await _context.Depositos.AnyAsync(d => d.IdDeposito == dto.IdDeposito))
        {
            return BadRequest(new { message = "El depósito indicado no existe." });
        }

        if (!await _context.Productos.AnyAsync(p => p.IdProducto == dto.IdProducto))
        {
            return BadRequest(new { message = "El producto indicado no existe." });
        }

        var stock = new StocksDeposito
        {
            IdDeposito = dto.IdDeposito,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad
        };

        _context.StocksDepositos.Add(stock);
        await _context.SaveChangesAsync();

        var response = await LoadStockAsync(stock.IdDeposito, stock.IdProducto) ?? stock;

        return CreatedAtAction(
            nameof(GetStock),
            new { idDeposito = response.IdDeposito, idProducto = response.IdProducto },
            ToDto(response));
    }

    [HttpPut("{idDeposito:int}/{idProducto:int}")]
    public async Task<ActionResult<StockDepositoDto>> UpdateStock(
        int idDeposito,
        int idProducto,
        StockDepositoUpsertDto dto)
    {
        if (idDeposito != dto.IdDeposito || idProducto != dto.IdProducto)
        {
            return BadRequest(new { message = "Los identificadores de la ruta no coinciden con el cuerpo de la solicitud." });
        }

        var stock = await _context.StocksDepositos.FindAsync(idDeposito, idProducto);
        if (stock is null)
        {
            return NotFound();
        }

        stock.Cantidad = dto.Cantidad;
        await _context.SaveChangesAsync();

        var response = await LoadStockAsync(idDeposito, idProducto) ?? stock;

        return Ok(ToDto(response));
    }

    [HttpDelete("{idDeposito:int}/{idProducto:int}")]
    public async Task<IActionResult> DeleteStock(int idDeposito, int idProducto)
    {
        var stock = await _context.StocksDepositos.FindAsync(idDeposito, idProducto);
        if (stock is null)
        {
            return NotFound();
        }

        _context.StocksDepositos.Remove(stock);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<StocksDeposito?> LoadStockAsync(int idDeposito, int idProducto)
    {
        return await _context.StocksDepositos
            .AsNoTracking()
            .Include(s => s.IdDepositoNavigation)
            .Include(s => s.IdProductoNavigation)
            .FirstOrDefaultAsync(s => s.IdDeposito == idDeposito && s.IdProducto == idProducto);
    }

    private static StockDepositoDto ToDto(StocksDeposito stock)
    {
        return new StockDepositoDto
        {
            IdDeposito = stock.IdDeposito,
            IdProducto = stock.IdProducto,
            Cantidad = stock.Cantidad,
            Deposito = stock.IdDepositoNavigation?.Nombre ?? string.Empty,
            Producto = stock.IdProductoNavigation?.Descripcion ?? string.Empty
        };
    }
}
