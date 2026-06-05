using api.Dtos.PeriodosContables;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PeriodosContablesController : CrudControllerBase<PeriodoContable, PeriodoContableDto, PeriodoContableUpsertDto, int>
{
    public PeriodosContablesController(ICrudService<PeriodoContable, int> service) : base(service)
    {
    }

    protected override PeriodoContableDto ToReadDto(PeriodoContable entity)
    {
        return new PeriodoContableDto
        {
            IdPeriodoContable = entity.IdPeriodoContable,
            IdProcesoContable = entity.IdProcesoContable,
            ProcesoContable = entity.IdProcesoContableNavigation?.Descripcion ?? entity.IdProcesoContable.ToString(),
            Anho = entity.Anho,
            Mes = entity.Mes,
            FechaInicio = entity.FechaInicio,
            FechaFin = entity.FechaFin,
            Estado = entity.Estado
        };
    }

    protected override PeriodoContable ToEntity(PeriodoContableUpsertDto dto)
    {
        return new PeriodoContable
        {
            IdProcesoContable = dto.IdProcesoContable,
            Anho = dto.Anho,
            Mes = dto.Mes,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            Estado = dto.Estado
        };
    }

    protected override int GetId(PeriodoContable entity)
    {
        return entity.IdPeriodoContable;
    }

    public override async Task<ActionResult<PeriodoContableDto>> Create(PeriodoContableUpsertDto dto)
    {
        try
        {
            return await base.Create(dto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public override async Task<ActionResult<PeriodoContableDto>> Update(int id, PeriodoContableUpsertDto dto)
    {
        try
        {
            return await base.Update(id, dto);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    public override async Task<IActionResult> Delete(int id)
    {
        try
        {
            return await base.Delete(id);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override async Task<PeriodoContable> RefreshCreatedEntityAsync(PeriodoContable entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPeriodoContable) ?? entity;
    }
}
