using api.Dtos.Categorias;
using api.Services;
using DatabaseHastaCompraVenta.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly ICrudService<Categoria, int> _categoriaService;

    public CategoriasController(ICrudService<Categoria, int> categoriaService)
    {
        _categoriaService = categoriaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriaDto>>> GetAll()
    {
        var categorias = await _categoriaService.GetAllAsync();
        return Ok(categorias.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoriaDto>> GetById(int id)
    {
        var categoria = await _categoriaService.GetByIdAsync(id);
        if (categoria is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(categoria));
    }

    [HttpPost]
    public async Task<ActionResult<CategoriaDto>> Create(CategoriaUpsertDto categoriaDto)
    {
        var createdCategoria = await _categoriaService.CreateAsync(MapToEntity(categoriaDto));
        return CreatedAtAction(nameof(GetById), new { id = createdCategoria.IdCategoria }, MapToDto(createdCategoria));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoriaDto>> Update(int id, CategoriaUpsertDto categoriaDto)
    {
        try
        {
            var updatedCategoria = await _categoriaService.UpdateAsync(id, MapToEntity(categoriaDto));
            return Ok(MapToDto(updatedCategoria));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _categoriaService.GetByIdAsync(id);
        if (categoria is null)
        {
            return NotFound();
        }

        await _categoriaService.DeleteAsync(id);
        return NoContent();
    }

    private static CategoriaDto MapToDto(Categoria categoria)
    {
        return new CategoriaDto
        {
            IdCategoria = categoria.IdCategoria,
            Nombre = categoria.Nombre
        };
    }

    private static Categoria MapToEntity(CategoriaUpsertDto categoriaDto)
    {
        return new Categoria
        {
            Nombre = categoriaDto.Nombre
        };
    }
}
