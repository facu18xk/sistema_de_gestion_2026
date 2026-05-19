using api.Dtos.Asientos;
using api.Dtos.Contabilidad;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsientosController : CrudControllerBase<Asiento, AsientoDto, AsientoUpsertDto, int>
{
    private readonly IAsientoContableService _asientoContableService;

    public AsientosController(
        ICrudService<Asiento, int> service,
        IAsientoContableService asientoContableService) : base(service)
    {
        _asientoContableService = asientoContableService;
    }

    [HttpPost("completo")]
    public async Task<ActionResult<AsientoCompletoDto>> CreateCompleto(AsientoCompletoUpsertDto dto)
    {
        try
        {
            var created = await _asientoContableService.CreateManualAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Asiento.IdAsiento }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("completo/{id:int}")]
    public async Task<ActionResult<AsientoCompletoDto>> UpdateCompleto(int id, AsientoCompletoUpsertDto dto)
    {
        try
        {
            return Ok(await _asientoContableService.UpdateManualAsync(id, dto));
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

    [HttpPost("generar-desde-modelo")]
    public async Task<ActionResult<AsientoCompletoDto>> GenerateFromModelo(GenerarAsientoDesdeModeloDto dto)
    {
        try
        {
            var created = await _asientoContableService.GenerateFromModeloAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Asiento.IdAsiento }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override AsientoDto ToReadDto(Asiento entity)
    {
        return new AsientoDto
        {
            IdAsiento = entity.IdAsiento,
            NumeroAsiento = entity.NumeroAsiento,
            IdPeriodoContable = entity.IdPeriodoContable,
            PeriodoContable = $"{entity.IdPeriodoContableNavigation?.Anho}/{entity.IdPeriodoContableNavigation?.Mes}",
            IdModulo = entity.IdModulo,
            Modulo = entity.IdModuloNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion,
            Automatico = entity.Automatico,
            Estado = entity.Estado,
            ReferenciaOrigen = entity.ReferenciaOrigen,
            IdOrigen = entity.IdOrigen,
            CreatedAt = entity.CreatedAt,
            FechaMayorizacion = entity.FechaMayorizacion
        };
    }

    protected override Asiento ToEntity(AsientoUpsertDto dto)
    {
        return new Asiento
        {
            NumeroAsiento = 0,
            IdModulo = dto.IdModulo,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion,
            Automatico = dto.Automatico,
            Estado = dto.Estado,
            ReferenciaOrigen = dto.ReferenciaOrigen,
            IdOrigen = dto.IdOrigen,
            CreatedAt = dto.CreatedAt,
            FechaMayorizacion = dto.FechaMayorizacion
        };
    }

    protected override int GetId(Asiento entity)
    {
        return entity.IdAsiento;
    }

    protected override async Task<Asiento> RefreshCreatedEntityAsync(Asiento entity)
    {
        return await CrudService.GetByIdAsync(entity.IdAsiento) ?? entity;
    }
}
