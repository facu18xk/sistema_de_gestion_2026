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
        var direccion = persona?.IdDireccionNavigation;
        var ciudad = direccion?.IdCiudadNavigation;

        return new ClienteDto
        {
            IdCliente = entity.IdCliente,
            Ci = entity.Ci,
            Ruc = entity.Ruc,
            FechaNacimiento = entity.FechaNacimiento,
            IdDireccion = persona?.IdDireccion ?? 0,
            Direccion = direccion is null
                ? null
                : new DireccionClienteDto
                {
                    IdDireccion = direccion.IdDireccion,
                    Calle1 = direccion.Calle1,
                    Calle2 = direccion.Calle2,
                    Descripcion = direccion.Descripcion,
                    IdCiudad = direccion.IdCiudad,
                    IdPais = ciudad?.IdPais ?? 0
                },
            Nombres = persona?.Nombres ?? string.Empty,
            Apellidos = persona?.Apellidos ?? string.Empty,
            Correo = persona?.Correo ?? string.Empty,
            Telefono = persona?.Telefono ?? string.Empty
        };
    }

    protected override Cliente ToEntity(ClienteUpsertDto dto)
    {
        var direccion = new Direccion
        {
            Calle1 = dto.Direccion.Calle1,
            Calle2 = dto.Direccion.Calle2,
            Descripcion = dto.Direccion.Descripcion,
            IdCiudad = dto.Direccion.IdCiudad
        };

        var persona = new Persona
        {
            IdDireccion = direccion.IdDireccion,
            Nombres = dto.Nombres,
            Apellidos = dto.Apellidos,
            Correo = dto.Correo,
            Telefono = dto.Telefono,
            IdDireccionNavigation = direccion
        };

        return new Cliente
        {
            Ci = dto.Ci,
            Ruc = dto.Ruc,
            FechaNacimiento = dto.FechaNacimiento,
            IdPersonaNavigation = persona
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