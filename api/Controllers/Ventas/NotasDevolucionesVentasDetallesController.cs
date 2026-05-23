using api.Dtos.NotasDevolucionesVentasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasDevolucionesVentasDetallesController : CrudControllerBase<NotasDevolucionesVentasDetalle, NotasDevolucionesVentasDetalleDto, NotasDevolucionesVentasDetalleUpsertDto, int>
{
    public NotasDevolucionesVentasDetallesController(ICrudService<NotasDevolucionesVentasDetalle, int> service)
        : base(service)
    {
    }

    protected override NotasDevolucionesVentasDetalleDto ToReadDto(NotasDevolucionesVentasDetalle entity)
    {
        return new NotasDevolucionesVentasDetalleDto
        {
            IdNotaDevolucionVentaDetalle = entity.IdNotaDevolucionVentaDetalle,
            IdNotaDevolucionVenta = entity.IdNotaDevolucionVenta,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Subtotal = entity.Subtotal
        };
    }

    protected override NotasDevolucionesVentasDetalle ToEntity(NotasDevolucionesVentasDetalleUpsertDto dto)
    {
        return new NotasDevolucionesVentasDetalle
        {
            IdNotaDevolucionVenta = dto.IdNotaDevolucionVenta,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Subtotal = dto.Subtotal
        };
    }

    protected override int GetId(NotasDevolucionesVentasDetalle entity)
    {
        return entity.IdNotaDevolucionVentaDetalle;
    }

    protected override async Task<NotasDevolucionesVentasDetalle> RefreshCreatedEntityAsync(NotasDevolucionesVentasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaDevolucionVentaDetalle) ?? entity;
    }
}
