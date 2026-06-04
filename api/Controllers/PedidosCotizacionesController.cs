using api.Dtos.PedidosCotizaciones;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosCotizacionesController : CrudControllerBase<PedidosCotizaciones, PedidosCotizacionesDto, PedidosCotizacionesUpsertDto, int>
{
    public PedidosCotizacionesController(ICrudService<PedidosCotizaciones, int> pedidoscotizacionesService)
        : base(pedidoscotizacionesService)
    {
    }

    protected override PedidosCotizacionesDto ToReadDto(PedidosCotizaciones entity)
    {
        return new PedidosCotizacionesDto
        {
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            IdPedidoCompra = entity.IdPedidoCompra,
            NumeroPedidoCompra = entity.IdPedidoCompraNavigation?.NumeroPedido ?? 0,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            NumeroPedido = entity.NumeroPedido,
            Fecha = entity.Fecha
        };
    }

    protected override PedidosCotizaciones ToEntity(PedidosCotizacionesUpsertDto dto)
    {
        return new PedidosCotizaciones
        {
            IdPedidoCompra = dto.IdPedidoCompra,
            IdEstado = dto.IdEstado,
            NumeroPedido = dto.NumeroPedido,
            Fecha = dto.Fecha
        };
    }

    protected override int GetId(PedidosCotizaciones entity)
    {
        return entity.IdPedidoCotizacion;
    }

    protected override async Task<PedidosCotizaciones> RefreshCreatedEntityAsync(PedidosCotizaciones entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPedidoCotizacion) ?? entity;
    }
}
