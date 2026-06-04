using api.Dtos.NotasDevolucionesVentas;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotasDevolucionesVentasController : CrudControllerBase<NotasDevolucionesVenta, NotasDevolucionesVentaDto, NotasDevolucionesVentaUpsertDto, int>
{
    public NotasDevolucionesVentasController(ICrudService<NotasDevolucionesVenta, int> service)
        : base(service)
    {
    }

    protected override NotasDevolucionesVentaDto ToReadDto(NotasDevolucionesVenta entity)
    {
        return new NotasDevolucionesVentaDto
        {
            IdNotaDevolucionVenta = entity.IdNotaDevolucionVenta,
            IdFacturaVenta = entity.IdFacturaVenta,
            FacturaVenta = entity.IdFacturaVentaNavigation?.NroComprobante ?? string.Empty,
            Motivo = entity.Motivo,
            Fecha = entity.Fecha
        };
    }

    protected override NotasDevolucionesVenta ToEntity(NotasDevolucionesVentaUpsertDto dto)
    {
        return new NotasDevolucionesVenta
        {
            IdFacturaVenta = dto.IdFacturaVenta,
            Motivo = dto.Motivo,
            Fecha = dto.Fecha
        };
    }

    protected override int GetId(NotasDevolucionesVenta entity)
    {
        return entity.IdNotaDevolucionVenta;
    }

    protected override async Task<NotasDevolucionesVenta> RefreshCreatedEntityAsync(NotasDevolucionesVenta entity)
    {
        return await CrudService.GetByIdAsync(entity.IdNotaDevolucionVenta) ?? entity;
    }
}
