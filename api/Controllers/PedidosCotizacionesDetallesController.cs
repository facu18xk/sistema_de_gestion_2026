using api.Dtos.PedidosCotizacionesDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosCotizacionesDetallesController : CrudControllerBase<PedidosCotizacionesDetalle, PedidosCotizacionesDetalleDto, PedidosCotizacionesDetalleUpsertDto, int>
{
    public PedidosCotizacionesDetallesController(ICrudService<PedidosCotizacionesDetalle, int> pedidosCotizacionesDetalleService)
        : base(pedidosCotizacionesDetalleService)
    {
    }

    protected override PedidosCotizacionesDetalleDto ToReadDto(PedidosCotizacionesDetalle entity)
    {
        return new PedidosCotizacionesDetalleDto
        {
            IdPedidoCotizacionDetalle = entity.IdPedidoCotizacionDetalle,
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            NumeroPedidoCotizacion = entity.IdPedidoCotizacionNavigation?.NumeroPedido ?? 0,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            Categoria = entity.Categoria,
            Descripcion = entity.Descripcion,
            Cantidad = entity.Cantidad,
            PrecioProducto = entity.PrecioProducto
        };
    }

    protected override PedidosCotizacionesDetalle ToEntity(PedidosCotizacionesDetalleUpsertDto dto)
    {
        return new PedidosCotizacionesDetalle
        {
            IdPedidoCotizacion = dto.IdPedidoCotizacion,
            IdProducto = dto.IdProducto,
            Categoria = dto.Categoria,
            Descripcion = dto.Descripcion,
            Cantidad = dto.Cantidad,
            PrecioProducto = dto.PrecioProducto
        };
    }

    protected override int GetId(PedidosCotizacionesDetalle entity)
    {
        return entity.IdPedidoCotizacionDetalle;
    }

    protected override async Task<PedidosCotizacionesDetalle> RefreshCreatedEntityAsync(PedidosCotizacionesDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPedidoCotizacionDetalle) ?? entity;
    }
}
