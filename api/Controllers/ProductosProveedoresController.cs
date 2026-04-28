using api.Dtos.ProductosProveedores;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosProveedoresController : CompositeCrudControllerBase<ProductoProveedor, ProductoProveedorDto, ProductoProveedorUpsertDto, int, int>
{
    public ProductosProveedoresController(ICompositeCrudService<ProductoProveedor, int, int> productoProveedorService)
        : base(productoProveedorService)
    {
    }

    public override async Task<ActionResult<ProductoProveedorDto>> Create(ProductoProveedorUpsertDto dto)
    {
        var createdEntity = await CrudService.CreateAsync(ToEntity(dto));
        var responseEntity = await CrudService.GetByIdAsync(createdEntity.ProductoId, createdEntity.ProveedorId) ?? createdEntity;

        return CreatedAtAction(nameof(GetById), GetRouteValues(responseEntity), ToReadDto(responseEntity));
    }

    public override async Task<ActionResult<ProductoProveedorDto>> Update(int key1, int key2, ProductoProveedorUpsertDto dto)
    {
        try
        {
            var updatedEntity = await CrudService.UpdateAsync(key1, key2, ToEntity(dto));
            var responseEntity = await CrudService.GetByIdAsync(updatedEntity.ProductoId, updatedEntity.ProveedorId) ?? updatedEntity;

            return Ok(ToReadDto(responseEntity));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    protected override ProductoProveedorDto ToReadDto(ProductoProveedor entity)
    {
        return new ProductoProveedorDto
        {
            ProductoId = entity.ProductoId,
            Producto = entity.Producto?.Descripcion ?? string.Empty,
            ProveedorId = entity.ProveedorId,
            Proveedor = entity.Proveedor?.RazonSocial ?? string.Empty,
            CategoriaId = entity.CategoriaId,
            Categoria = entity.Categoria?.Nombre ?? string.Empty,
            CodigoProveedor = entity.CodigoProveedor,
            Activo = entity.Activo
        };
    }

    protected override ProductoProveedor ToEntity(ProductoProveedorUpsertDto dto)
    {
        return new ProductoProveedor
        {
            ProductoId = dto.ProductoId,
            ProveedorId = dto.ProveedorId,
            CategoriaId = dto.CategoriaId,
            CodigoProveedor = dto.CodigoProveedor,
            Activo = dto.Activo
        };
    }

    protected override object GetRouteValues(ProductoProveedor entity)
    {
        return new { key1 = entity.ProductoId, key2 = entity.ProveedorId };
    }
}
