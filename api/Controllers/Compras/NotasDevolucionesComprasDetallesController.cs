using api.Dtos.NotasDevolucionesComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasDevolucionesComprasDetallesController : CrudControllerBase<NotasDevolucionesComprasDetalle, NotasDevolucionesComprasDetalleDto, NotasDevolucionesComprasDetalleUpsertDto, int>
{
    public NotasDevolucionesComprasDetallesController(ICrudService<NotasDevolucionesComprasDetalle, int> service)
        : base(service)
    {
    }

    protected override NotasDevolucionesComprasDetalleDto ToReadDto(NotasDevolucionesComprasDetalle entity)
    {
        var producto = entity.IdProductoNavigation;

        return new NotasDevolucionesComprasDetalleDto
        {
            IdNotaDevolucionCompraDetalle = entity.IdNotaDevolucionCompraDetalle,
            IdNotaDevolucionCompra = entity.IdNotaDevolucionCompra,
            IdProducto = entity.IdProducto,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Subtotal = entity.Subtotal,
            Producto = producto is null 
                ? null 
                : new ProductoNotaDevolucionDetalleItemDto 
                {
                    IdProducto = producto.IdProducto,
                    Descripcion = producto.Descripcion 
                }
        };
    }

    protected override NotasDevolucionesComprasDetalle ToEntity(NotasDevolucionesComprasDetalleUpsertDto dto)
    {
        return new NotasDevolucionesComprasDetalle
        {
            IdNotaDevolucionCompra = dto.IdNotaDevolucionCompra,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Subtotal = dto.Subtotal
        };
    }

    protected override int GetId(NotasDevolucionesComprasDetalle entity)
    {
        return entity.IdNotaDevolucionCompraDetalle;
    }

    protected override async Task<NotasDevolucionesComprasDetalle> RefreshCreatedEntityAsync(NotasDevolucionesComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaDevolucionCompraDetalle) ?? entity;
    }
}