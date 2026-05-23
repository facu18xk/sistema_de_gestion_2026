using api.Dtos.NotasCreditosVentas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasCreditosVentasController : CrudControllerBase<NotasCreditosVenta, NotasCreditosVentaDto, NotasCreditosVentaUpsertDto, int>
{
    public NotasCreditosVentasController(ICrudService<NotasCreditosVenta, int> service)
        : base(service)
    {
    }

    protected override NotasCreditosVentaDto ToReadDto(NotasCreditosVenta entity)
    {
        return new NotasCreditosVentaDto
        {
            IdNotaCreditoVenta = entity.IdNotaCreditoVenta,
            IdFacturaVenta = entity.IdFacturaVenta,
            FacturaVenta = entity.IdFacturaVentaNavigation?.NroComprobante ?? string.Empty,
            IdNotaDevolucionVenta = entity.IdNotaDevolucionVenta,
            NotaDevolucionVenta = entity.IdNotaDevolucionVentaNavigation?.Motivo ?? string.Empty,
            IdTimbrado = entity.IdTimbrado,
            Timbrado = entity.IdTimbradoNavigation?.NumeroTimbrado ?? string.Empty,
            Motivo = entity.Motivo,
            FechaEmision = entity.FechaEmision,
            Total = entity.Total
        };
    }

    protected override NotasCreditosVenta ToEntity(NotasCreditosVentaUpsertDto dto)
    {
        return new NotasCreditosVenta
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            IdNotaDevolucionVenta = dto.IdNotaDevolucionVenta,
            IdTimbrado = dto.IdTimbrado,
            Motivo = dto.Motivo,
            FechaEmision = dto.FechaEmision,
            Total = dto.Total
        };
    }

    protected override int GetId(NotasCreditosVenta entity)
    {
        return entity.IdNotaCreditoVenta;
    }

    protected override async Task<NotasCreditosVenta> RefreshCreatedEntityAsync(NotasCreditosVenta entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaCreditoVenta) ?? entity;
    }
}
