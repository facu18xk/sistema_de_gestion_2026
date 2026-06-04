using api.Dtos.CuentasContables;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CuentasContablesController : CrudControllerBase<CuentaContable, CuentaContableDto, CuentaContableUpsertDto, int>
{
    public CuentasContablesController(ICrudService<CuentaContable, int> service) : base(service)
    {
    }

    protected override CuentaContableDto ToReadDto(CuentaContable entity)
    {
        return new CuentaContableDto
        {
            IdCuentaContable = entity.IdCuentaContable,
            IdProcesoContable = entity.IdProcesoContable,
            ProcesoContable = entity.IdProcesoContableNavigation?.Descripcion ?? entity.IdProcesoContable.ToString(),
            IdCuentaPadre = entity.IdCuentaPadre,
            CuentaPadre = entity.IdCuentaPadreNavigation?.Nombre ?? string.Empty,
            NumeroCuenta = entity.NumeroCuenta,
            Nombre = entity.Nombre,
            TipoCuenta = entity.TipoCuenta,
            EsAsentable = entity.EsAsentable,
            Activa = entity.Activa
        };
    }

    protected override CuentaContable ToEntity(CuentaContableUpsertDto dto)
    {
        return new CuentaContable
        {
            IdProcesoContable = dto.IdProcesoContable,
            IdCuentaPadre = dto.IdCuentaPadre,
            NumeroCuenta = dto.NumeroCuenta,
            Nombre = dto.Nombre,
            TipoCuenta = dto.TipoCuenta,
            EsAsentable = dto.EsAsentable,
            Activa = dto.Activa
        };
    }

    protected override int GetId(CuentaContable entity)
    {
        return entity.IdCuentaContable;
    }

    protected override async Task<CuentaContable> RefreshCreatedEntityAsync(CuentaContable entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCuentaContable) ?? entity;
    }
}
