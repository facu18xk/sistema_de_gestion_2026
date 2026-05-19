using api.Dtos.Common;
using api.Dtos.PreciosVentas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreciosVentasController : ControllerBase
{
    private readonly PreciosVentasService _preciosVentasService;

    public PreciosVentasController(PreciosVentasService preciosVentasService)
    {
        _preciosVentasService = preciosVentasService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<PrecioVentaDto>>> GetAll([FromQuery] PaginationQueryDto pagination)
    {
        var result = await _preciosVentasService.GetAllAsync(pagination);

        return Ok(new PagedResultDto<PrecioVentaDto>
        {
            Items = result.Items.Select(ToReadDto).ToArray(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages,
            HasPreviousPage = result.HasPreviousPage,
            HasNextPage = result.HasNextPage
        });
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PrecioVentaDto>> GetById(int id)
    {
        var entity = await _preciosVentasService.GetByIdAsync(id);
        if (entity is null)
        {
            return NotFound();
        }

        return Ok(ToReadDto(entity));
    }

    [HttpGet("producto/{idProducto:int}/activo")]
    public async Task<ActionResult<PrecioVentaDto>> GetActiveByProduct(int idProducto)
    {
        var entity = await _preciosVentasService.GetActiveByProductAsync(idProducto);
        if (entity is null)
        {
            return NotFound();
        }

        return Ok(ToReadDto(entity));
    }

    [HttpPost]
    public async Task<ActionResult<PrecioVentaDto>> Create(PrecioVentaCreateDto dto)
    {
        PrecioVenta createdEntity;
        try
        {
            createdEntity = await _preciosVentasService.CreateAsync(new PrecioVenta
            {
                IdProducto = dto.IdProducto,
                PorcentajeGanancia = dto.PorcentajeGanancia
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var responseEntity = await _preciosVentasService.GetByIdAsync(createdEntity.IdPrecioVenta) ?? createdEntity;
        return CreatedAtAction(nameof(GetById), new { id = responseEntity.IdPrecioVenta }, ToReadDto(responseEntity));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PrecioVentaDto>> Update(int id, PrecioVentaUpdateDto dto)
    {
        try
        {
            var entity = await _preciosVentasService.UpdateAsync(id, new PrecioVenta
            {
                PorcentajeGanancia = dto.PorcentajeGanancia
            });

            return Ok(ToReadDto(entity));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    private static PrecioVentaDto ToReadDto(PrecioVenta entity)
    {
        return new PrecioVentaDto
        {
            IdPrecioVenta = entity.IdPrecioVenta,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            PrecioCompraBase = entity.PrecioCompraBase,
            PorcentajeGanancia = entity.PorcentajeGanancia,
            PrecioVenta = entity.PrecioVentaValor,
            Activo = entity.Activo,
            FechaDesde = entity.FechaDesde,
            FechaHasta = entity.FechaHasta
        };
    }
}
