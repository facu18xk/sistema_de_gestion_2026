using api.Dtos.Proveedores;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProveedoresController : CrudControllerBase<Proveedor, ProveedorDto, ProveedorUpsertDto, int>
{
    public ProveedoresController(ICrudService<Proveedor, int> proveedorService)
        : base(proveedorService)
    {
    }

    protected override ProveedorDto ToReadDto(Proveedor entity)
    {
        var persona = entity.IdProveedorNavigation;
        var direccion = persona?.IdDireccionNavigation;
        var ciudad = direccion?.IdCiudadNavigation;

        return new ProveedorDto
        {
            IdProveedor = entity.IdProveedor,
            Ruc = entity.Ruc,
            RazonSocial = entity.RazonSocial,
            NombreFantasia = entity.NombreFantasia,
            IdDireccion = persona?.IdDireccion ?? 0,
            Direccion = direccion is null
                ? null
                : new DireccionProveedorDto
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

    protected override Proveedor ToEntity(ProveedorUpsertDto dto)
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
            Telefono = dto.Telefono
        };

        persona.IdDireccionNavigation = direccion;

        return new Proveedor
        {
            Ruc = dto.Ruc,
            RazonSocial = dto.RazonSocial,
            NombreFantasia = dto.NombreFantasia,
            IdProveedorNavigation = persona
        };
    }

    protected override int GetId(Proveedor entity)
    {
        return entity.IdProveedor;
    }

    protected override async Task<Proveedor> RefreshCreatedEntityAsync(Proveedor entity)
    {
        return await CrudService.GetByIdAsync(entity.IdProveedor) ?? entity;
    }
}
