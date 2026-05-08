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
        var direccion = persona?.IdDireccionNavigation;
        var ciudad = direccion?.IdCiudadNavigation;

        return new EmpleadoDto
        {
            IdEmpleado = entity.IdEmpleado,
            Ci = entity.Ci,
            Ruc = entity.Ruc,
            FechaIngreso = entity.FechaIngreso,
            IdDireccion = persona?.IdDireccion ?? 0,
            Direccion = direccion is null
                ? null
                : new DireccionEmpleadoDto
                {
                    IdPersona = persona.IdPersona,
                    IdDireccion = persona.IdDireccion,
                    Nombres = persona.Nombres,
                    Apellidos = persona.Apellidos,
                    Correo = persona.Correo,
                    Telefono = persona.Telefono
                }
        };
    }

    protected override Empleado ToEntity(EmpleadoUpsertDto dto)
    {
        // 1. Armamos la dirección
        var direccion = new Direccion
        {
            Calle1 = dto.Direccion.Calle1,
            Calle2 = dto.Direccion.Calle2,
            Descripcion = dto.Direccion.Descripcion,
            IdCiudad = dto.Direccion.IdCiudad
        };

        // 2. Armamos la persona y le inyectamos la dirección
        var persona = new Persona
        {
            IdDireccion = direccion.IdDireccion,
            Nombres = dto.Nombres,
            Apellidos = dto.Apellidos,
            Correo = dto.Correo,
            Telefono = dto.Telefono,
            IdDireccionNavigation = direccion
        };

        // 3. Armamos el empleado y le inyectamos la persona
        return new Empleado
        {
            Ci = dto.Ci,
            Ruc = dto.Ruc,
            FechaIngreso = dto.FechaIngreso,
<<<<<<< HEAD
            IdPersonaNavigation = new Persona
            {
                IdDireccion = dto.IdDireccion,
                Nombres = dto.Nombres,
                Apellidos = dto.Apellidos,
                Correo = dto.Correo,
                Telefono = dto.Telefono
            }
=======
            IdPersonaNavigation = persona
>>>>>>> origin/cliente
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