using api.Dtos.OrdenesComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesComprasDetallesController : CrudControllerBase<OrdenesComprasDetalle, OrdenesComprasDetalleDto, OrdenesComprasDetalleUpsertDto, int>
{
    public OrdenesComprasDetallesController(ICrudService<OrdenesComprasDetalle, int> service)
        : base(service)
    {
    }

    protected override OrdenesComprasDetalleDto ToReadDto(OrdenesComprasDetalle entity)
    {
        var producto = entity.IdProductoNavigation;

        return new OrdenesComprasDetalleDto
        {
            IdOrdenCompraDetalle = entity.IdOrdenCompraDetalle,
            IdOrdenCompra = entity.IdOrdenCompra,
            IdProducto = entity.IdProducto,
            Cantidad = entity.Cantidad,
            Producto = producto is null 
                ? null 
                : new ProductoDetalleDto 
                {
                    IdProducto = producto.IdProducto,
                    Nombre = producto.Descripcion 
                }
        };
    }

    protected override OrdenesComprasDetalle ToEntity(OrdenesComprasDetalleUpsertDto dto)
    {
        return new OrdenesComprasDetalle
        {
            IdOrdenCompraDetalle = dto.IdOrdenCompraDetalle,
            IdOrdenCompra = dto.IdOrdenCompra,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad
        };
    }

    protected override int GetId(OrdenesComprasDetalle entity)
    {
        return entity.IdOrdenCompraDetalle;
    }

    protected override async Task<OrdenesComprasDetalle> RefreshCreatedEntityAsync(OrdenesComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenCompraDetalle) ?? entity;
    }
}