using api.Dtos.AsientosDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AsientosDetallesController : CrudControllerBase<AsientosDetalle, AsientosDetalleDto, AsientosDetalleUpsertDto, int>
{
    public AsientosDetallesController(ICrudService<AsientosDetalle, int> service) : base(service)
    {
    }

    protected override AsientosDetalleDto ToReadDto(AsientosDetalle entity)
    {
        return new AsientosDetalleDto
        {
            IdAsientoDetalle = entity.IdAsientoDetalle,
            IdAsiento = entity.IdAsiento,
            NumeroAsiento = entity.IdAsientoNavigation?.NumeroAsiento ?? 0,
            IdCuentaContable = entity.IdCuentaContable,
            CuentaContable = entity.IdCuentaContableNavigation?.Nombre ?? string.Empty,
            Item = entity.Item,
            TipoMovimiento = entity.TipoMovimiento,
            Monto = entity.Monto,
            DescripcionItem = entity.DescripcionItem
        };
    }

    protected override AsientosDetalle ToEntity(AsientosDetalleUpsertDto dto)
    {
        return new AsientosDetalle
        {
            IdAsiento = dto.IdAsiento,
            IdCuentaContable = dto.IdCuentaContable,
            Item = dto.Item,
            TipoMovimiento = dto.TipoMovimiento,
            Monto = dto.Monto,
            DescripcionItem = dto.DescripcionItem
        };
    }

    protected override int GetId(AsientosDetalle entity)
    {
        return entity.IdAsientoDetalle;
    }

    protected override async Task<AsientosDetalle> RefreshCreatedEntityAsync(AsientosDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdAsientoDetalle) ?? entity;
    }
}
