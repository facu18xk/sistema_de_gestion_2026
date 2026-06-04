using api.Dtos.Personas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonasController : CrudControllerBase<Persona, PersonaDto, PersonaUpsertDto, int>
{
    public PersonasController(ICrudService<Persona, int> service)
        : base(service)
    {
    }

    protected override PersonaDto ToReadDto(Persona entity)
    {
        var direccion = entity.IdDireccionNavigation;

        return new PersonaDto
        {
            IdPersona = entity.IdPersona,
            IdDireccion = entity.IdDireccion,
            Nombres = entity.Nombres,
            Apellidos = entity.Apellidos,
            Correo = entity.Correo,
            Telefono = entity.Telefono,
            Direccion = direccion is null 
                ? null 
                : new DireccionPersonaDto 
                {
                    IdDireccion = direccion.IdDireccion,
                    Calle1 = direccion.Calle1,
                    Descripcion = direccion.Descripcion
                }
        };
    }

    protected override Persona ToEntity(PersonaUpsertDto dto)
    {
        return new Persona
        {
            IdPersona = dto.IdPersona,
            IdDireccion = dto.IdDireccion,
            Nombres = dto.Nombres,
            Apellidos = dto.Apellidos,
            Correo = dto.Correo,
            Telefono = dto.Telefono
        };
    }

    protected override int GetId(Persona entity)
    {
        return entity.IdPersona;
    }

    protected override async Task<Persona> RefreshCreatedEntityAsync(Persona entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPersona) ?? entity;
    }
}