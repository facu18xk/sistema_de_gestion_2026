using api.Dtos.NotasCreditosVentasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasCreditosVentasDetallesController : CrudControllerBase<NotasCreditosVentasDetalle, NotasCreditosVentasDetalleDto, NotasCreditosVentasDetalleUpsertDto, int>
{
    public NotasCreditosVentasDetallesController(ICrudService<NotasCreditosVentasDetalle, int> service)
        : base(service)
    {
    }

    protected override NotasCreditosVentasDetalleDto ToReadDto(NotasCreditosVentasDetalle entity)
    {
        return new NotasCreditosVentasDetalleDto
        {
            IdNotaCreditoVentaDetalle = entity.IdNotaCreditoVentaDetalle,
            IdNotaCreditoVenta = entity.IdNotaCreditoVenta,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Subtotal = entity.Subtotal
        };
    }

    protected override NotasCreditosVentasDetalle ToEntity(NotasCreditosVentasDetalleUpsertDto dto)
    {
        return new NotasCreditosVentasDetalle
        {
            IdNotaCreditoVenta = dto.IdNotaCreditoVenta,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Subtotal = dto.Subtotal
        };
    }

    protected override int GetId(NotasCreditosVentasDetalle entity)
    {
        return entity.IdNotaCreditoVentaDetalle;
    }

    protected override async Task<NotasCreditosVentasDetalle> RefreshCreatedEntityAsync(NotasCreditosVentasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaCreditoVentaDetalle) ?? entity;
    }
}
