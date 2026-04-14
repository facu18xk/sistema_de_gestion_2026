using api.Dtos.Marcas;
using api.Services;
using DatabaseHastaCompraVenta.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarcasController : ControllerBase
{
    private readonly ICrudService<Marca, int> _marcaService;

    public MarcasController(ICrudService<Marca, int> marcaService)
    {
        _marcaService = marcaService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MarcaDto>>> GetAll()
    {
        var marcas = await _marcaService.GetAllAsync();
        return Ok(marcas.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MarcaDto>> GetById(int id)
    {
        var marca = await _marcaService.GetByIdAsync(id);
        if (marca is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(marca));
    }

    [HttpPost]
    public async Task<ActionResult<MarcaDto>> Create(MarcaUpsertDto marcaDto)
    {
        var createdMarca = await _marcaService.CreateAsync(MapToEntity(marcaDto));
        return CreatedAtAction(nameof(GetById), new { id = createdMarca.IdMarca }, MapToDto(createdMarca));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<MarcaDto>> Update(int id, MarcaUpsertDto marcaDto)
    {
        try
        {
            var updatedMarca = await _marcaService.UpdateAsync(id, MapToEntity(marcaDto));
            return Ok(MapToDto(updatedMarca));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var marca = await _marcaService.GetByIdAsync(id);
        if (marca is null)
        {
            return NotFound();
        }

        await _marcaService.DeleteAsync(id);
        return NoContent();
    }

    private static MarcaDto MapToDto(Marca marca)
    {
        return new MarcaDto
        {
            IdMarca = marca.IdMarca,
            Nombre = marca.Nombre
        };
    }

    private static Marca MapToEntity(MarcaUpsertDto marcaDto)
    {
        return new Marca
        {
            Nombre = marcaDto.Nombre
        };
    }
}
