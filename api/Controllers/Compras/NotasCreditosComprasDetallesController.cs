using api.Dtos.NotasCreditosComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasCreditosComprasDetallesController : CrudControllerBase<NotasCreditosComprasDetalle, NotasCreditosComprasDetalleDto, NotasCreditosComprasDetalleUpsertDto, int>
{
    public NotasCreditosComprasDetallesController(ICrudService<NotasCreditosComprasDetalle, int> service)
        : base(service)
    {
    }

    protected override NotasCreditosComprasDetalleDto ToReadDto(NotasCreditosComprasDetalle entity)
    {
        var producto = entity.IdProductoNavigation;

        return new NotasCreditosComprasDetalleDto
        {
            IdNotaCreditoCompraDetalle = entity.IdNotaCreditoCompraDetalle,
            IdNotaCreditoCompra = entity.IdNotaCreditoCompra,
            IdProducto = entity.IdProducto,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Subtotal = entity.Subtotal,
            Producto = producto is null 
                ? null 
                : new ProductoNotaCreditoDetalleItemDto 
                {
                    IdProducto = producto.IdProducto,
                    Descripcion = producto.Descripcion
                }
        };
    }

    protected override NotasCreditosComprasDetalle ToEntity(NotasCreditosComprasDetalleUpsertDto dto)
    {
        return new NotasCreditosComprasDetalle
        {
            IdNotaCreditoCompra = dto.IdNotaCreditoCompra,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Subtotal = dto.Subtotal
        };
    }

    protected override int GetId(NotasCreditosComprasDetalle entity)
    {
        return entity.IdNotaCreditoCompraDetalle;
    }

    protected override async Task<NotasCreditosComprasDetalle> RefreshCreatedEntityAsync(NotasCreditosComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaCreditoCompraDetalle) ?? entity;
    }
}