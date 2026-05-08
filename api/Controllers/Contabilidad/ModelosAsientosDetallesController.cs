using api.Dtos.ModelosAsientosDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelosAsientosDetallesController : CrudControllerBase<ModelosAsientosDetalle, ModelosAsientosDetalleDto, ModelosAsientosDetalleUpsertDto, int>
{
    public ModelosAsientosDetallesController(ICrudService<ModelosAsientosDetalle, int> service) : base(service)
    {
    }

    protected override ModelosAsientosDetalleDto ToReadDto(ModelosAsientosDetalle entity)
    {
        return new ModelosAsientosDetalleDto
        {
            IdModeloAsientoDetalle = entity.IdModeloAsientoDetalle,
            IdModeloAsiento = entity.IdModeloAsiento,
            ModeloAsiento = entity.IdModeloAsientoNavigation?.TipoAsiento ?? string.Empty,
            IdCuentaContable = entity.IdCuentaContable,
            CuentaContable = entity.IdCuentaContableNavigation?.Nombre ?? string.Empty,
            Item = entity.Item,
            TipoMovimiento = entity.TipoMovimiento,
            DescripcionItem = entity.DescripcionItem
        };
    }

    protected override ModelosAsientosDetalle ToEntity(ModelosAsientosDetalleUpsertDto dto)
    {
        return new ModelosAsientosDetalle
        {
            IdModeloAsiento = dto.IdModeloAsiento,
            IdCuentaContable = dto.IdCuentaContable,
            Item = dto.Item,
            TipoMovimiento = dto.TipoMovimiento,
            DescripcionItem = dto.DescripcionItem
        };
    }

    protected override int GetId(ModelosAsientosDetalle entity)
    {
        return entity.IdModeloAsientoDetalle;
    }

    protected override async Task<ModelosAsientosDetalle> RefreshCreatedEntityAsync(ModelosAsientosDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdModeloAsientoDetalle) ?? entity;
    }
}
