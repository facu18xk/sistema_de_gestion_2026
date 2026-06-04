using api.Dtos.CotizacionesCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CotizacionesComprasController : CrudControllerBase<CotizacionesCompra, CotizacionesCompraDto, CotizacionesCompraUpsertDto, int>
{
    public CotizacionesComprasController(ICrudService<CotizacionesCompra, int> cotizacionesCompraService)
        : base(cotizacionesCompraService)
    {
    }

    protected override CotizacionesCompraDto ToReadDto(CotizacionesCompra entity)
    {
        return new CotizacionesCompraDto
        {
            IdCotizacionCompra = entity.IdCotizacionCompra,
            SolicitudCotizacionId = entity.SolicitudCotizacionId,
            NumeroSolicitudCotizacion = entity.SolicitudCotizacion?.NumeroPedido ?? 0,
            ProveedorId = entity.ProveedorId,
            Proveedor = entity.Proveedor?.RazonSocial ?? string.Empty,
            Fecha = entity.Fecha,
            ValidaHasta = entity.ValidaHasta,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty
        };
    }

    protected override CotizacionesCompra ToEntity(CotizacionesCompraUpsertDto dto)
    {
        return new CotizacionesCompra
        {
            SolicitudCotizacionId = dto.SolicitudCotizacionId,
            ProveedorId = dto.ProveedorId,
            Fecha = dto.Fecha,
            ValidaHasta = dto.ValidaHasta,
            IdEstado = dto.IdEstado
        };
    }

    protected override int GetId(CotizacionesCompra entity)
    {
        return entity.IdCotizacionCompra;
    }

    protected override async Task<CotizacionesCompra> RefreshCreatedEntityAsync(CotizacionesCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCotizacionCompra) ?? entity;
    }
}
