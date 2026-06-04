using api.Dtos.PedidosComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosComprasDetallesController : CrudControllerBase<PedidosComprasDetalle, PedidosComprasDetalleDto, PedidosComprasDetalleUpsertDto, int>
{
    public PedidosComprasDetallesController(ICrudService<PedidosComprasDetalle, int> pedidoscomprasdetalleService)
        : base(pedidoscomprasdetalleService)
    {
    }

    protected override PedidosComprasDetalleDto ToReadDto(PedidosComprasDetalle entity)
    {
        return new PedidosComprasDetalleDto
        {
            IdPedidoCompraDetalle = entity.IdPedidoCompraDetalle,
            IdPedidoCompra = entity.IdPedidoCompra,
            NumeroPedidoCompra = entity.IdPedidoCompraNavigation?.NumeroPedido ?? 0,
            IdProducto = entity.IdProducto,
            Producto = entity.IdProductoNavigation?.Descripcion ?? string.Empty,
            IdCategoria = entity.IdCategoria,
            Categoria = entity.IdCategoriaNavigation?.Nombre ?? string.Empty,
            Descripcion = entity.Descripcion,
            Cantidad = entity.Cantidad
        };
    }

    protected override PedidosComprasDetalle ToEntity(PedidosComprasDetalleUpsertDto dto)
    {
        return new PedidosComprasDetalle
        {
            IdPedidoCompra = dto.IdPedidoCompra,
            IdProducto = dto.IdProducto,
            IdCategoria = dto.IdCategoria,
            Descripcion = dto.Descripcion,
            Cantidad = dto.Cantidad
        };
    }

    protected override int GetId(PedidosComprasDetalle entity)
    {
        return entity.IdPedidoCompraDetalle;
    }

    protected override async Task<PedidosComprasDetalle> RefreshCreatedEntityAsync(PedidosComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPedidoCompraDetalle) ?? entity;
    }
}
