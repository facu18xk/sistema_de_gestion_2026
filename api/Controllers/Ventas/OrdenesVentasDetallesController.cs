using api.Dtos.OrdenesVentasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesVentasDetallesController : CrudControllerBase<OrdenesVentasDetalle, OrdenesVentasDetalleDto, OrdenesVentasDetalleUpsertDto, int>
{
    public OrdenesVentasDetallesController(ICrudService<OrdenesVentasDetalle, int> service)
        : base(service)
    {
    }

    protected override OrdenesVentasDetalleDto ToReadDto(OrdenesVentasDetalle entity)
    {
        return new OrdenesVentasDetalleDto
        {
            IdOrdenVentaDetalle = entity.IdOrdenVentaDetalle,
            IdOrdenVenta = entity.IdOrdenVenta,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario
        };
    }

    protected override OrdenesVentasDetalle ToEntity(OrdenesVentasDetalleUpsertDto dto)
    {
        return new OrdenesVentasDetalle
        {
            IdOrdenVenta = dto.IdOrdenVenta,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario
        };
    }

    protected override int GetId(OrdenesVentasDetalle entity)
    {
        return entity.IdOrdenVentaDetalle;
    }

    protected override async Task<OrdenesVentasDetalle> RefreshCreatedEntityAsync(OrdenesVentasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenVentaDetalle) ?? entity;
    }
}
