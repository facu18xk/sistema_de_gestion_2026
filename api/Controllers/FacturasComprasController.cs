using api.Dtos.FacturasCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasComprasController : CrudControllerBase<FacturasCompra, FacturasCompraDto, FacturasCompraUpsertDto, int>
{
    public FacturasComprasController(ICrudService<FacturasCompra, int> facturascompraService)
        : base(facturascompraService)
    {
    }

    protected override FacturasCompraDto ToReadDto(FacturasCompra entity)
    {
        return new FacturasCompraDto
        {
            IdFacturaCompra = entity.IdFacturaCompra,
            IdOrdenCompra = entity.IdOrdenCompra,
            OrdenCompraDescripcion = entity.IdOrdenCompraNavigation?.Descripcion ?? string.Empty,
            IdProveedor = entity.IdProveedor,
            Proveedor = entity.IdProveedorNavigation?.RazonSocial ?? string.Empty,
            NroComprobante = entity.NroComprobante,
            Timbrado = entity.Timbrado,
            Fecha = entity.Fecha,
            Descripcion = entity.Descripcion
        };
    }

    protected override FacturasCompra ToEntity(FacturasCompraUpsertDto dto)
    {
        return new FacturasCompra
        {
            IdOrdenCompra = dto.IdOrdenCompra,
            IdProveedor = dto.IdProveedor,
            NroComprobante = dto.NroComprobante,
            Timbrado = dto.Timbrado,
            Fecha = dto.Fecha,
            Descripcion = dto.Descripcion
        };
    }

    protected override int GetId(FacturasCompra entity)
    {
        return entity.IdFacturaCompra;
    }

    protected override async Task<FacturasCompra> RefreshCreatedEntityAsync(FacturasCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdFacturaCompra) ?? entity;
    }
}
