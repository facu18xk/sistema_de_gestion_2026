using api.Dtos.ProcesosContables;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProcesosContablesController : CrudControllerBase<ProcesoContable, ProcesoContableDto, ProcesoContableUpsertDto, int>
{
    public ProcesosContablesController(ICrudService<ProcesoContable, int> service) : base(service)
    {
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
            Moneda = dto.Moneda,
            Estado = dto.Estado,
            CreatedAt = dto.CreatedAt
        };
    }

    protected override int GetId(ProcesoContable entity)
    {
        return entity.IdProcesoContable;
    }
}
