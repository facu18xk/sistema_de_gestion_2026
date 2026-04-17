using api.Services;
using api.Dtos.Productos;
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
    public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll()
    {
        var productos = await _productoService.GetAllAsync();
        return Ok(productos.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductoDto>> GetById(int id)
    {
        var producto = await _productoService.GetByIdAsync(id);
        if (producto is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(producto));
    }

    [HttpPost]
    public async Task<ActionResult<ProductoDto>> Create(ProductoUpsertDto productoDto)
    {
        var producto = MapToEntity(productoDto);
        var createdProducto = await _productoService.CreateAsync(producto);
        var productoConRelaciones = await _productoService.GetByIdAsync(createdProducto.IdProducto);
        return CreatedAtAction(nameof(GetById), new { id = createdProducto.IdProducto }, MapToDto(productoConRelaciones ?? createdProducto));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductoDto>> Update(int id, ProductoUpsertDto productoDto)
    {
        try
        {
            var producto = MapToEntity(productoDto);
            var updatedProducto = await _productoService.UpdateAsync(id, producto);
            var productoConRelaciones = await _productoService.GetByIdAsync(updatedProducto.IdProducto);
            return Ok(MapToDto(productoConRelaciones ?? updatedProducto));
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

    private static ProductoDto MapToDto(Producto producto)
    {
        return new ProductoDto
        {
            IdProducto = producto.IdProducto,
            Descripcion = producto.Descripcion,
            PrecioUnitario = producto.PrecioUnitario,
            EsServicio = producto.EsServicio,
            PorcentajeIva = producto.PorcentajeIva,
            IdMarca = producto.IdMarca,
            Marca = producto.IdMarcaNavigation?.Nombre ?? string.Empty,
            IdCategoria = producto.IdCategoria,
            Categoria = producto.IdCategoriaNavigation?.Nombre ?? string.Empty
        };
    }

    private static Producto MapToEntity(ProductoUpsertDto productoDto)
    {
        return new Producto
        {
            Descripcion = productoDto.Descripcion,
            PrecioUnitario = productoDto.PrecioUnitario,
            EsServicio = productoDto.EsServicio,
            PorcentajeIva = productoDto.PorcentajeIva,
            IdMarca = productoDto.IdMarca,
            IdCategoria = productoDto.IdCategoria
        };
    }
}
