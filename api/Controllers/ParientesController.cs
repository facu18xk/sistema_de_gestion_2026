using api.Dtos.Parientes;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParientesController : CrudControllerBase<Pariente, ParienteDto, ParienteUpsertDto, int>
{
    public ParientesController(ICrudService<Pariente, int> service)
        : base(service)
    {
    }

    protected override ParienteDto ToReadDto(Pariente entity)
    {
        var empleado = entity.IdEmpleadoNavigation;
        var persona = empleado?.IdPersonaNavigation;

        return new ParienteDto
        {
            IdPariente = entity.IdPariente,
            IdEmpleado = entity.IdEmpleado,
            TipoRelacion = entity.TipoRelacion,
            Edad = entity.Edad,
            FechaNacimiento = entity.FechaNacimiento,
            Empleado = empleado is null 
                ? null 
                : new EmpleadoParienteDto 
                {
                    IdEmpleado = empleado.IdEmpleado,
                    Nombres = persona?.Nombres ?? string.Empty,
                    Apellidos = persona?.Apellidos ?? string.Empty
                }
        };
    }

    protected override Pariente ToEntity(ParienteUpsertDto dto)
    {
        return new Pariente
        {
            IdPariente = dto.IdPariente,
            IdEmpleado = dto.IdEmpleado,
            TipoRelacion = dto.TipoRelacion,
            Edad = dto.Edad,
            FechaNacimiento = dto.FechaNacimiento
        };
    }

    protected override int GetId(Pariente entity)
    {
        return entity.IdPariente;
    }

    protected override async Task<Pariente> RefreshCreatedEntityAsync(Pariente entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPariente) ?? entity;
    }
}