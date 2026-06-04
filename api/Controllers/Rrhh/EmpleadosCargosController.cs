using api.Dtos.Rrhh;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpleadosCargosController : CrudControllerBase<EmpleadoCargo, EmpleadoCargoDto, EmpleadoCargoUpsertDto, int>
{
    public EmpleadosCargosController(ICrudService<EmpleadoCargo, int> service) : base(service)
    {
    }

    protected override EmpleadoCargoDto ToReadDto(EmpleadoCargo entity)
    {
        var persona = entity.IdEmpleadoNavigation?.IdPersonaNavigation;
        return new EmpleadoCargoDto
        {
            IdEmpleadoCargo = entity.IdEmpleadoCargo,
            IdEmpleado = entity.IdEmpleado,
            Empleado = persona is null ? string.Empty : $"{persona.Nombres} {persona.Apellidos}".Trim(),
            IdCargo = entity.IdCargo,
            Cargo = entity.IdCargoNavigation?.Nombre ?? string.Empty,
            FechaDesde = entity.FechaDesde,
            FechaHasta = entity.FechaHasta,
            Activo = entity.Activo
        };
    }

    protected override EmpleadoCargo ToEntity(EmpleadoCargoUpsertDto dto)
    {
        return new EmpleadoCargo
        {
            IdEmpleadoCargo = dto.IdEmpleadoCargo,
            IdEmpleado = dto.IdEmpleado,
            IdCargo = dto.IdCargo,
            FechaDesde = dto.FechaDesde,
            FechaHasta = dto.FechaHasta,
            Activo = dto.Activo
        };
    }

    protected override int GetId(EmpleadoCargo entity) => entity.IdEmpleadoCargo;

    protected override async Task<EmpleadoCargo> RefreshCreatedEntityAsync(EmpleadoCargo entity)
    {
        return await CrudService.GetByIdAsync(entity.IdEmpleadoCargo) ?? entity;
    }
}
