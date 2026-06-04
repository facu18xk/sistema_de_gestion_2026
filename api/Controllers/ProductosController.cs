using api.Dtos.Productos;
using api.Services;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : CrudControllerBase<Producto, ProductoDto, ProductoUpsertDto, int>
{
    public ProductosController(ICrudService<Producto, int> productoService)
        : base(productoService)
    {
    }

    protected override ProductoDto ToReadDto(Producto entity)
    {
        return new ProductoDto
        {
            IdProducto = entity.IdProducto,
            Descripcion = entity.Descripcion,
            PrecioUnitario = entity.PrecioUnitario,
            EsServicio = entity.EsServicio,
            PorcentajeIva = entity.PorcentajeIva,
            CantidadTotal = entity.CantidadTotal,
            IdMarca = entity.IdMarca,
            Marca = entity.IdMarcaNavigation?.Nombre ?? string.Empty,
            IdCategoria = entity.IdCategoria,
            Categoria = entity.IdCategoriaNavigation?.Nombre ?? string.Empty
        };
    }

    protected override Producto ToEntity(ProductoUpsertDto dto)
    {
        return new Producto
        {
            Descripcion = dto.Descripcion,
            PrecioUnitario = dto.PrecioUnitario,
            EsServicio = dto.EsServicio,
            PorcentajeIva = dto.PorcentajeIva,
            IdMarca = dto.IdMarca,
            IdCategoria = dto.IdCategoria
        };
    }

    protected override int GetId(Producto entity)
    {
        return entity.IdProducto;
    }

    protected override async Task<Producto> RefreshCreatedEntityAsync(Producto entity)
    {
        return await CrudService.GetByIdAsync(entity.IdProducto) ?? entity;
    }
}
