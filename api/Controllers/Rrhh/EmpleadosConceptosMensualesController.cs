using api.Dtos.Rrhh;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpleadosConceptosMensualesController : CrudControllerBase<EmpleadoConceptoMensual, EmpleadoConceptoMensualDto, EmpleadoConceptoMensualUpsertDto, int>
{
    public EmpleadosConceptosMensualesController(ICrudService<EmpleadoConceptoMensual, int> service) : base(service)
    {
    }

    protected override EmpleadoConceptoMensualDto ToReadDto(EmpleadoConceptoMensual entity)
    {
        var persona = entity.IdEmpleadoNavigation?.IdPersonaNavigation;
        return new EmpleadoConceptoMensualDto
        {
            IdEmpleadoConceptoMensual = entity.IdEmpleadoConceptoMensual,
            IdEmpleado = entity.IdEmpleado,
            Empleado = persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim(),
            IdConceptoSalario = entity.IdConceptoSalario,
            ConceptoSalario = entity.IdConceptoSalarioNavigation?.Descripcion ?? string.Empty,
            Monto = entity.Monto,
            FechaDesde = entity.FechaDesde,
            FechaHasta = entity.FechaHasta,
            Activo = entity.Activo
        };
    }

    protected override EmpleadoConceptoMensual ToEntity(EmpleadoConceptoMensualUpsertDto dto)
    {
        return new EmpleadoConceptoMensual
        {
            IdEmpleadoConceptoMensual = dto.IdEmpleadoConceptoMensual,
            IdEmpleado = dto.IdEmpleado,
            IdConceptoSalario = dto.IdConceptoSalario,
            Monto = dto.Monto,
            FechaDesde = dto.FechaDesde,
            FechaHasta = dto.FechaHasta,
            Activo = dto.Activo
        };
    }

    protected override int GetId(EmpleadoConceptoMensual entity) => entity.IdEmpleadoConceptoMensual;

    protected override async Task<EmpleadoConceptoMensual> RefreshCreatedEntityAsync(EmpleadoConceptoMensual entity)
    {
        return await CrudService.GetByIdAsync(entity.IdEmpleadoConceptoMensual) ?? entity;
    }
}
