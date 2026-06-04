using api.Dtos.FacturasVentasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasVentasDetallesController : CrudControllerBase<FacturasVentasDetalle, FacturasVentasDetalleDto, FacturasVentasDetalleUpsertDto, int>
{
    public FacturasVentasDetallesController(ICrudService<FacturasVentasDetalle, int> service)
        : base(service)
    {
    }

    protected override FacturasVentasDetalleDto ToReadDto(FacturasVentasDetalle entity)
    {
        return new FacturasVentasDetalleDto
        {
            IdFacturaVentaDetalle = entity.IdFacturaVentaDetalle,
            IdFacturaVenta = entity.IdFacturaVenta,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            CantidadDevuelta = entity.IdFacturaVentaNavigation?.NotasCreditosVenta
                .SelectMany(nc => nc.NotasCreditosVentasDetalles)
                .Where(ncvd => ncvd.IdProducto == entity.IdProducto)
                .Sum(ncvd => ncvd.Cantidad) ?? 0,
            PrecioUnitario = entity.PrecioUnitario,
            TotalBruto = entity.TotalBruto,
            TotalIva = entity.TotalIva,
            TotalNeto = entity.TotalNeto
        };
    }

    protected override FacturasVentasDetalle ToEntity(FacturasVentasDetalleUpsertDto dto)
    {
        return new FacturasVentasDetalle
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdProducto = dto.IdProducto,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            TotalBruto = dto.TotalBruto,
            TotalIva = dto.TotalIva,
            TotalNeto = dto.TotalNeto
        };
    }

    protected override int GetId(FacturasVentasDetalle entity)
    {
        return entity.IdFacturaVentaDetalle;
    }

    protected override async Task<FacturasVentasDetalle> RefreshCreatedEntityAsync(FacturasVentasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaVentaDetalle) ?? entity;
    }
}
