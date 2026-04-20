using api.Dtos.OrdenesPagosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesPagosComprasController : CrudControllerBase<OrdenesPagosCompra, OrdenesPagosCompraDto, OrdenesPagosCompraUpsertDto, int>
{
    public OrdenesPagosComprasController(ICrudService<OrdenesPagosCompra, int> ordenespagoscompraService)
        : base(ordenespagoscompraService)
    {
    }

    protected override OrdenesPagosCompraDto ToReadDto(OrdenesPagosCompra entity)
    {
        return new OrdenesPagosCompraDto
        {
            IdOrdenPagoCompra = entity.IdOrdenPagoCompra,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            IdEstado = entity.IdEstado,
            Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override OrdenesPagosCompra ToEntity(OrdenesPagosCompraUpsertDto dto)
    {
        return new OrdenesPagosCompra
        {
            IdProveedor = dto.IdProveedor,
            IdEstado = dto.IdEstado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(OrdenesPagosCompra entity)
    {
        return entity.IdOrdenPagoCompra;
    }

    protected override async Task<OrdenesPagosCompra> RefreshCreatedEntityAsync(OrdenesPagosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenPagoCompra) ?? entity;
    }
}
