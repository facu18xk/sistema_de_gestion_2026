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
        return new ProveedorDto
        {
            IdProveedor = entity.IdProveedor,
            Ruc = entity.Ruc,
            RazonSocial = entity.RazonSocial,
            NombreFantasia = entity.NombreFantasia,
            IdDireccion = entity.IdProveedorNavigation?.IdDireccion ?? 0,
            Nombres = entity.IdProveedorNavigation?.Nombres ?? string.Empty,
            Apellidos = entity.IdProveedorNavigation?.Apellidos ?? string.Empty,
            Correo = entity.IdProveedorNavigation?.Correo ?? string.Empty,
            Telefono = entity.IdProveedorNavigation?.Telefono ?? string.Empty
        };
    }

    protected override Proveedor ToEntity(ProveedorUpsertDto dto)
    {
        return new Proveedor
        {
            Ruc = dto.Ruc,
            RazonSocial = dto.RazonSocial,
            NombreFantasia = dto.NombreFantasia,
            IdProveedorNavigation = new Persona
            {
                IdDireccion = dto.IdDireccion,
                Nombres = dto.Nombres,
                Apellidos = dto.Apellidos,
                Correo = dto.Correo,
                Telefono = dto.Telefono
            }
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
