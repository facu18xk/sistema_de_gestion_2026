using api.Dtos.PedidosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosComprasController : CrudControllerBase<PedidosCompra, PedidosCompraDto, PedidosCompraUpsertDto, int>
{
    private readonly ComprasCompletasService _comprasCompletasService;

    public PedidosComprasController(
        ICrudService<PedidosCompra, int> pedidoscompraService,
        ComprasCompletasService comprasCompletasService)
        : base(pedidoscompraService)
    {
        _comprasCompletasService = comprasCompletasService;
    }

    [HttpPost("completo")]
    public async Task<ActionResult<PedidosCompraDto>> CreateCompleto(PedidosCompraCompletoCreateDto dto)
    {
        try
        {
            var createdEntity = await _comprasCompletasService.CreatePedidoCompraAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEntity.IdPedidoCompra }, ToReadDto(createdEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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
