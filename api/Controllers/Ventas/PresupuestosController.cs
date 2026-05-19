using api.Dtos.Presupuestos;
using api.Dtos.Common;
using api.Dtos.Ventas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PresupuestosController : CrudControllerBase<Presupuesto, PresupuestoDto, PresupuestoUpsertDto, int>
{
    private readonly VentasCompletasService _ventasCompletasService;

    public PresupuestosController(ICrudService<Presupuesto, int> service, VentasCompletasService ventasCompletasService)
        : base(service)
    {
        _ventasCompletasService = ventasCompletasService;
    }

    [HttpPost("completo")]
    public async Task<ActionResult<PresupuestoDto>> CreateCompleto(PresupuestoCompletoCreateDto dto)
    {
        try
        {
            var createdEntity = await _ventasCompletasService.CreatePresupuestoAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEntity.IdPresupuesto }, ToReadDto(createdEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("completo")]
    public async Task<ActionResult<PagedResultDto<PresupuestoCompletoDto>>> GetAllCompleto([FromQuery] PaginationQueryDto pagination)
    {
        var result = await _ventasCompletasService.GetPresupuestosCompletosAsync(pagination);

        return Ok(new PagedResultDto<PresupuestoCompletoDto>
        {
            Items = result.Items.Select(ApplyEstadoByDates).ToArray(),
            Page = result.Page,
            PageSize = result.PageSize,
            TotalCount = result.TotalCount,
            TotalPages = result.TotalPages,
            HasPreviousPage = result.HasPreviousPage,
            HasNextPage = result.HasNextPage
        });
    }

    [HttpGet("{id:int}/completo")]
    public async Task<ActionResult<PresupuestoCompletoDto>> GetByIdCompleto(int id)
    {
        var presupuesto = await _ventasCompletasService.GetPresupuestoCompletoAsync(id);
        if (presupuesto is null)
        {
            return NotFound();
        }

        return Ok(ApplyEstadoByDates(presupuesto));
    }

    [HttpPut("{id:int}/completo")]
    public async Task<ActionResult<PresupuestoCompletoDto>> UpdateCompleto(int id, PresupuestoCompletoCreateDto dto)
    {
        try
        {
            var presupuesto = await _ventasCompletasService.UpdatePresupuestoAsync(id, dto);
            return Ok(ApplyEstadoByDates(presupuesto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}/completo")]
    public async Task<IActionResult> DeleteCompleto(int id)
    {
        try
        {
            await _ventasCompletasService.DeletePresupuestoCompletoAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override PresupuestoDto ToReadDto(Presupuesto entity)
    {
        return ApplyEstadoByDates(new PresupuestoDto
        {
            IdPresupuesto = entity.IdPresupuesto,
            IdCliente = entity.IdCliente,
            Cliente = FormatCliente(entity.IdClienteNavigation),
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,
            FechaVencimiento = entity.FechaVencimiento
        });
    }

    protected override Presupuesto ToEntity(PresupuestoUpsertDto dto)
    {
        return new Presupuesto
        {
            IdCliente = dto.IdCliente,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            FechaVencimiento = dto.FechaVencimiento
        };
    }

    protected override int GetId(Presupuesto entity)
    {
        return entity.IdPresupuesto;
    }

    protected override async Task<Presupuesto> RefreshCreatedEntityAsync(Presupuesto entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPresupuesto) ?? entity;
    }

    private static string FormatCliente(Cliente? cliente)
    {
        var persona = cliente?.IdPersonaNavigation;
        return persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim();
    }

    private static PresupuestoDto ApplyEstadoByDates(PresupuestoDto presupuesto)
    {
        presupuesto.Estado = CalculateEstadoByDates(presupuesto.Fecha, presupuesto.FechaVencimiento);
        return presupuesto;
    }

    private static PresupuestoCompletoDto ApplyEstadoByDates(PresupuestoCompletoDto presupuesto)
    {
        presupuesto.Estado = CalculateEstadoByDates(presupuesto.Fecha, presupuesto.FechaVencimiento);
        return presupuesto;
    }

    private static string CalculateEstadoByDates(DateTime fecha, DateTime fechaVencimiento)
    {
        var today = DateTime.Today;

        if (today < fecha.Date)
        {
            return "Pendiente";
        }

        return today > fechaVencimiento.Date ? "Vencido" : "Vigente";
    }
}
