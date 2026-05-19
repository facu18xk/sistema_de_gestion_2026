using api.Dtos.OrdenesCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesComprasController : CrudControllerBase<OrdenesCompra, OrdenesCompraDto, OrdenesCompraUpsertDto, int>
{
    public OrdenesComprasController(ICrudService<OrdenesCompra, int> ordenescompraService)
        : base(ordenescompraService)
    {
    }

    protected override OrdenesCompraDto ToReadDto(OrdenesCompra entity)
    {
        return new OrdenesCompraDto
        {
            IdOrdenCompra = entity.IdOrdenCompra,
            IdPedidoCotizacion = entity.IdPedidoCotizacion,
            NumeroPedidoCotizacion = entity.IdPedidoCotizacionNavigation?.NumeroPedido ?? 0,
            IdCotizacionCompra = entity.IdCotizacionCompra,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override OrdenesCompra ToEntity(OrdenesCompraUpsertDto dto)
    {
        return new OrdenesCompra
        {
            IdPedidoCotizacion = dto.IdPedidoCotizacion,
            IdCotizacionCompra = dto.IdCotizacionCompra,
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(OrdenesCompra entity)
    {
        return entity.IdOrdenCompra;
    }

    protected override async Task<OrdenesCompra> RefreshCreatedEntityAsync(OrdenesCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenCompra) ?? entity;
    }
}
