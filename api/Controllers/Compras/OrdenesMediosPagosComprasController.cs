using api.Dtos.OrdenesMediosPagosCompras;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesMediosPagosComprasController : CrudControllerBase<OrdenesMediosPagosCompra, OrdenesMediosPagosCompraDto, OrdenesMediosPagosCompraUpsertDto, int>
{
    public OrdenesMediosPagosComprasController(ICrudService<OrdenesMediosPagosCompra, int> service)
        : base(service)
    {
    }

    protected override OrdenesMediosPagosCompraDto ToReadDto(OrdenesMediosPagosCompra entity)
    {
        var medioPago = entity.IdMedioPagoCompraNavigation;

        return new OrdenesMediosPagosCompraDto
        {
            IdOrdenMedioPagoCompra = entity.IdOrdenMedioPagoCompra,
            IdOrdenPagoCompra = entity.IdOrdenPagoCompra,
            IdMedioPagoCompra = entity.IdMedioPagoCompra,
            Monto = entity.Monto,
            MedioPago = medioPago is null 
                ? null 
                : new MedioPagoResumenDto 
                {
                    IdMedioPagoCompra = medioPago.IdMedioPagoCompra,
                    Nombre = medioPago.Nombre
                }
        };
    }

    protected override OrdenesMediosPagosCompra ToEntity(OrdenesMediosPagosCompraUpsertDto dto)
    {
        return new OrdenesMediosPagosCompra
        {
            IdOrdenMedioPagoCompra = dto.IdOrdenMedioPagoCompra,
            IdOrdenPagoCompra = dto.IdOrdenPagoCompra,
            IdMedioPagoCompra = dto.IdMedioPagoCompra,
            Monto = dto.Monto
        };
    }

    protected override int GetId(OrdenesMediosPagosCompra entity)
    {
        return entity.IdOrdenMedioPagoCompra;
    }

    protected override async Task<OrdenesMediosPagosCompra> RefreshCreatedEntityAsync(OrdenesMediosPagosCompra entity)
    {
        return await CrudService.GetByIdAsync(entity.IdOrdenMedioPagoCompra) ?? entity;
    }
}