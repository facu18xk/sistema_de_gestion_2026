using api.Dtos.CotizacionesComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CotizacionesComprasDetallesController : CrudControllerBase<CotizacionesComprasDetalle, CotizacionesComprasDetalleDto, CotizacionesComprasDetalleUpsertDto, int>
{
    public CotizacionesComprasDetallesController(ICrudService<CotizacionesComprasDetalle, int> cotizacionesComprasDetalleService)
        : base(cotizacionesComprasDetalleService)
    {
    }

    protected override CotizacionesComprasDetalleDto ToReadDto(CotizacionesComprasDetalle entity)
    {
        return new CotizacionesComprasDetalleDto
        {
            IdCotizacionCompraDetalle = entity.IdCotizacionCompraDetalle,
            CotizacionCompraId = entity.CotizacionCompraId,
            ProductoId = entity.ProductoId,
            Producto = entity.Producto?.Descripcion ?? string.Empty,
            Cantidad = entity.Cantidad,
            PrecioUnitario = entity.PrecioUnitario,
            Descuento = entity.Descuento
        };
    }

    protected override CotizacionesComprasDetalle ToEntity(CotizacionesComprasDetalleUpsertDto dto)
    {
        return new CotizacionesComprasDetalle
        {
            CotizacionCompraId = dto.CotizacionCompraId,
            ProductoId = dto.ProductoId,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Descuento = dto.Descuento
        };
    }

    protected override int GetId(CotizacionesComprasDetalle entity)
    {
        return entity.IdCotizacionCompraDetalle;
    }

    protected override async Task<CotizacionesComprasDetalle> RefreshCreatedEntityAsync(CotizacionesComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCotizacionCompraDetalle) ?? entity;
    }
}
