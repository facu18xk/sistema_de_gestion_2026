using api.Dtos.Empleados;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmpleadosController : CrudControllerBase<Empleado, EmpleadoDto, EmpleadoUpsertDto, int>
{
    public EmpleadosController(ICrudService<Empleado, int> service)
        : base(service)
    {
    }

    protected override EmpleadoDto ToReadDto(Empleado entity)
    {
        var persona = entity.IdPersonaNavigation;

        return new EmpleadoDto
        {
            IdEmpleado = entity.IdEmpleado,
            IdPersona = entity.IdPersona,
            Ci = entity.Ci,
            Ruc = entity.Ruc,
            FechaIngreso = entity.FechaIngreso,
            Persona = persona is null 
                ? null 
                : new PersonaEmpleadoDto 
                {
                    IdPersona = persona.IdPersona,
                    Nombres = persona.Nombres,
                    Apellidos = persona.Apellidos
                }
        };
    }

    protected override Empleado ToEntity(EmpleadoUpsertDto dto)
    {
        return new Empleado
        {
            IdEmpleado = dto.IdEmpleado,
            IdPersona = dto.IdPersona,
            Ci = dto.Ci,
            Ruc = dto.Ruc,
            FechaIngreso = dto.FechaIngreso
        };
    }

    protected override int GetId(Empleado entity)
    {
        return entity.IdEmpleado;
    }

    protected override async Task<Empleado> RefreshCreatedEntityAsync(Empleado entity)
    {
        return await CrudService.GetByIdAsync(entity.IdEmpleado) ?? entity;
    }
}