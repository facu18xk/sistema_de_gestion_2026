using api.Dtos.Rrhh;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParametrosSalariosController : CrudControllerBase<ParametroSalario, ParametroSalarioDto, ParametroSalarioUpsertDto, int>
{
    public ParametrosSalariosController(ICrudService<ParametroSalario, int> service) : base(service)
    {
    }

    protected override ParametroSalarioDto ToReadDto(ParametroSalario entity)
    {
        return new ParametroSalarioDto
        {
            IdParametroSalario = entity.IdParametroSalario,
            FechaDesde = entity.FechaDesde,
            FechaHasta = entity.FechaHasta,
            SalarioMinimo = entity.SalarioMinimo,
            PorcentajeIpsEmpleado = entity.PorcentajeIpsEmpleado,
            PorcentajeBonificacionFamiliar = entity.PorcentajeBonificacionFamiliar,
            Activo = entity.Activo
        };
    }

    protected override ParametroSalario ToEntity(ParametroSalarioUpsertDto dto)
    {
        return new ParametroSalario
        {
            IdParametroSalario = dto.IdParametroSalario,
            FechaDesde = dto.FechaDesde,
            FechaHasta = dto.FechaHasta,
            SalarioMinimo = dto.SalarioMinimo,
            PorcentajeIpsEmpleado = dto.PorcentajeIpsEmpleado,
            PorcentajeBonificacionFamiliar = dto.PorcentajeBonificacionFamiliar,
            Activo = dto.Activo
        };
    }

    protected override int GetId(ParametroSalario entity) => entity.IdParametroSalario;
}
