using api.Dtos.OrdenesPagosComprasDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesPagosComprasDetallesController : CrudControllerBase<OrdenesPagosComprasDetalle, OrdenesPagosComprasDetalleDto, OrdenesPagosComprasDetalleUpsertDto, int>
{
    public OrdenesPagosComprasDetallesController(ICrudService<OrdenesPagosComprasDetalle, int> service)
        : base(service)
    {
    }

    protected override OrdenesPagosComprasDetalleDto ToReadDto(OrdenesPagosComprasDetalle entity)
    {
        var factura = entity.IdFacturaCompraNavigation;

        return new OrdenesPagosComprasDetalleDto
        {
            IdOrdenPagoCompraDetalle = entity.IdOrdenPagoCompraDetalle,
            IdOrdenPagoCompra = entity.IdOrdenPagoCompra,
            IdFacturaCompra = entity.IdFacturaCompra,
            Monto = entity.Monto,
            FacturaCompra = factura is null 
                ? null 
                : new FacturaCompraResumenDto 
                {
                    IdFacturaCompra = factura.IdFacturaCompra
                }
        };
    }

    protected override OrdenesPagosComprasDetalle ToEntity(OrdenesPagosComprasDetalleUpsertDto dto)
    {
        return new OrdenesPagosComprasDetalle
        {
            IdOrdenPagoCompraDetalle = dto.IdOrdenPagoCompraDetalle,
            IdOrdenPagoCompra = dto.IdOrdenPagoCompra,
            IdFacturaCompra = dto.IdFacturaCompra,
            Monto = dto.Monto
        };
    }

    protected override int GetId(OrdenesPagosComprasDetalle entity)
    {
        return entity.IdOrdenPagoCompraDetalle;
    }

    protected override async Task<OrdenesPagosComprasDetalle> RefreshCreatedEntityAsync(OrdenesPagosComprasDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenPagoCompraDetalle) ?? entity;
    }
}