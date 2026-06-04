using api.Dtos.ProcesosContables;
using api.Dtos.PeriodosContables;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcesosContablesController : CrudControllerBase<ProcesoContable, ProcesoContableDto, ProcesoContableUpsertDto, int>
{
    private readonly IPeriodoContableGeneratorService _periodoGeneratorService;

    public ProcesosContablesController(
        ICrudService<ProcesoContable, int> service,
        IPeriodoContableGeneratorService periodoGeneratorService) : base(service)
    {
        _periodoGeneratorService = periodoGeneratorService;
    }

    [HttpPost("{id:int}/generar-periodos")]
    public async Task<ActionResult<List<PeriodoContableDto>>> GenerateYearPeriods(int id)
    {
        try
        {
            var periods = await _periodoGeneratorService.GenerateYearPeriodsAsync(id);
            return Ok(periods.Select(ToPeriodoDto).ToList());
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override ProcesoContableDto ToReadDto(ProcesoContable entity)
    {
        return new ProcesoContableDto
        {
            IdProcesoContable = entity.IdProcesoContable,
            PeriodoAnho = entity.PeriodoAnho,
            Descripcion = entity.Descripcion,
            CantNiveles = entity.CantNiveles,
            CantDigitosNivel = entity.CantDigitosNivel,
            Moneda = entity.Moneda,
            Estado = entity.Estado,
            CreatedAt = entity.CreatedAt
        };
    }

    protected override ProcesoContable ToEntity(ProcesoContableUpsertDto dto)
    {
        return new ProcesoContable
        {
            PeriodoAnho = dto.PeriodoAnho,
            Descripcion = dto.Descripcion,
            CantNiveles = dto.CantNiveles,
            CantDigitosNivel = dto.CantDigitosNivel,
            Moneda = dto.Moneda
        };
    }

    protected override int GetId(ProcesoContable entity)
    {
        return entity.IdProcesoContable;
    }

    private static PeriodoContableDto ToPeriodoDto(PeriodoContable entity)
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
}
