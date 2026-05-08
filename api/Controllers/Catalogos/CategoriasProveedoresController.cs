using api.Dtos.CategoriasProveedores;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasProveedoresController : CompositeCrudControllerBase<CategoriaProveedor, CategoriaProveedorDto, CategoriaProveedorUpsertDto, int, int>
{
    public CategoriasProveedoresController(ICompositeCrudService<CategoriaProveedor, int, int> categoriaProveedorService)
        : base(categoriaProveedorService)
    {
    }

    public override async Task<ActionResult<CategoriaProveedorDto>> Create(CategoriaProveedorUpsertDto dto)
    {
        var createdEntity = await CrudService.CreateAsync(ToEntity(dto));
        var responseEntity = await CrudService.GetByIdAsync(createdEntity.ProveedorId, createdEntity.CategoriaId) ?? createdEntity;

        return CreatedAtAction(nameof(GetById), GetRouteValues(responseEntity), ToReadDto(responseEntity));
    }

    public override async Task<ActionResult<CategoriaProveedorDto>> Update(int key1, int key2, CategoriaProveedorUpsertDto dto)
    {
        try
        {
            var updatedEntity = await CrudService.UpdateAsync(key1, key2, ToEntity(dto));
            var responseEntity = await CrudService.GetByIdAsync(updatedEntity.ProveedorId, updatedEntity.CategoriaId) ?? updatedEntity;

            return Ok(ToReadDto(responseEntity));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    protected override CategoriaProveedorDto ToReadDto(CategoriaProveedor entity)
    {
        return new CategoriaProveedorDto
        {
            ProveedorId = entity.ProveedorId,
            Proveedor = entity.Proveedor?.RazonSocial ?? string.Empty,
            CategoriaId = entity.CategoriaId,
            Categoria = entity.Categoria?.Nombre ?? string.Empty
        };
    }

    protected override CategoriaProveedor ToEntity(CategoriaProveedorUpsertDto dto)
    {
        return new CategoriaProveedor
        {
            ProveedorId = dto.ProveedorId,
            CategoriaId = dto.CategoriaId
        };
    }

    protected override object GetRouteValues(CategoriaProveedor entity)
    {
        return new { key1 = entity.ProveedorId, key2 = entity.CategoriaId };
    }
}
