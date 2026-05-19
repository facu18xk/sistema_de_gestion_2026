using api.Dtos.PresupuestosDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PresupuestosDetallesController : CrudControllerBase<PresupuestosDetalle, PresupuestosDetalleDto, PresupuestosDetalleUpsertDto, int>
{
    public PresupuestosDetallesController(ICrudService<PresupuestosDetalle, int> service)
        : base(service)
    {
    }

    protected override PresupuestosDetalleDto ToReadDto(PresupuestosDetalle entity)
    {
        return new PresupuestosDetalleDto
        {
            IdPresupuestoDetalle = entity.IdPresupuestoDetalle,
            IdPresupuesto = entity.IdPresupuesto,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Iva = entity.Iva,
            Subtotal = entity.Subtotal
        };
    }

    protected override PresupuestosDetalle ToEntity(PresupuestosDetalleUpsertDto dto)
    {
        return new PresupuestosDetalle
        {
            IdPresupuesto = dto.IdPresupuesto,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Iva = dto.Iva,
            Subtotal = dto.Subtotal
        };
    }

    protected override int GetId(PresupuestosDetalle entity)
    {
        return entity.IdPresupuestoDetalle;
    }

    protected override async Task<PresupuestosDetalle> RefreshCreatedEntityAsync(PresupuestosDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPresupuestoDetalle) ?? entity;
    }
}
