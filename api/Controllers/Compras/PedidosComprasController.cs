using api.Dtos.PedidosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosComprasController : CrudControllerBase<PedidosCompra, PedidosCompraDto, PedidosCompraUpsertDto, int>
{
    public PedidosComprasController(ICrudService<PedidosCompra, int> pedidoscompraService)
        : base(pedidoscompraService)
    {
    }

    protected override PedidosCompraDto ToReadDto(PedidosCompra entity)
    {
        return new PedidosCompraDto
        {
            IdPedidoCompra = entity.IdPedidoCompra,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            NumeroPedido = entity.NumeroPedido,
            Fecha = entity.Fecha
        };
    }

    protected override PedidosCompra ToEntity(PedidosCompraUpsertDto dto)
    {
        return new PedidosCompra
        {
            IdEstado = dto.IdEstado,
            NumeroPedido = dto.NumeroPedido,
            Fecha = dto.Fecha
        };
    }

    protected override int GetId(PedidosCompra entity)
    {
        return entity.IdPedidoCompra;
    }

    protected override async Task<PedidosCompra> RefreshCreatedEntityAsync(PedidosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPedidoCompra) ?? entity;
    }
}
