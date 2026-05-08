using api.Dtos.Clientes;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : CrudControllerBase<Cliente, ClienteDto, ClienteUpsertDto, int>
{
    public ClientesController(ICrudService<Cliente, int> service)
        : base(service)
    {
    }

    protected override ClienteDto ToReadDto(Cliente entity)
    {
        var persona = entity.IdPersonaNavigation;

        return new ClienteDto
        {
            IdCliente = entity.IdCliente,
            IdPersona = entity.IdPersona,
            Ci = entity.Ci,
            Ruc = entity.Ruc,
            FechaNacimiento = entity.FechaNacimiento,
            Persona = persona is null 
                ? null 
                : new PersonaClienteDto 
                {
                    IdPersona = persona.IdPersona,
                    Nombres = persona.Nombres,
                    Apellidos = persona.Apellidos
                }
        };
    }

    protected override Cliente ToEntity(ClienteUpsertDto dto)
    {
        return new Cliente
        {
            IdCliente = dto.IdCliente,
            IdPersona = dto.IdPersona,
            Ci = dto.Ci,
            Ruc = dto.Ruc,
            FechaNacimiento = dto.FechaNacimiento
        };
    }

    protected override int GetId(Cliente entity)
    {
        return entity.IdCliente;
    }

    protected override async Task<Cliente> RefreshCreatedEntityAsync(Cliente entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCliente) ?? entity;
    }
}