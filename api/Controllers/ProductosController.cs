using api.Services;
using DatabaseHastaCompraVenta.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly ICrudService<Producto, int> _productoService;

    public ProductosController(ICrudService<Producto, int> productoService)
    {
        _productoService = productoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Producto>>> GetAll()
    {
        var productos = await _productoService.GetAllAsync();
        return Ok(productos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Producto>> GetById(int id)
    {
        var producto = await _productoService.GetByIdAsync(id);
        if (producto is null)
        {
            return NotFound();
        }

        return Ok(producto);
    }

    [HttpPost]
    public async Task<ActionResult<Producto>> Create(Producto producto)
    {
        var createdProducto = await _productoService.CreateAsync(producto);
        return CreatedAtAction(nameof(GetById), new { id = createdProducto.IdProducto }, createdProducto);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Producto>> Update(int id, Producto producto)
    {
        try
        {
            var updatedProducto = await _productoService.UpdateAsync(id, producto);
            return Ok(updatedProducto);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var producto = await _productoService.GetByIdAsync(id);
        if (producto is null)
        {
            return NotFound();
        }

        await _productoService.DeleteAsync(id);
        return NoContent();
    }
}
