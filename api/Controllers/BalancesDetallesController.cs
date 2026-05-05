using api.Dtos.BalancesDetalles;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BalancesDetallesController : CrudControllerBase<BalancesDetalle, BalancesDetalleDto, BalancesDetalleUpsertDto, int>
{
    public BalancesDetallesController(ICrudService<BalancesDetalle, int> service) : base(service)
    {
    }

    protected override BalancesDetalleDto ToReadDto(BalancesDetalle entity)
    {
        return new BalancesDetalleDto
        {
            IdBalanceDetalle = entity.IdBalanceDetalle,
            IdBalance = entity.IdBalance,
            Balance = entity.IdBalanceNavigation?.TipoBalance ?? string.Empty,
            IdCuentaContable = entity.IdCuentaContable,
            CuentaContable = entity.IdCuentaContableNavigation?.Nombre ?? string.Empty,
            TotalDebe = entity.TotalDebe,
            TotalHaber = entity.TotalHaber,
            SaldoDeudor = entity.SaldoDeudor,
            SaldoAcreedor = entity.SaldoAcreedor
        };
    }

    protected override BalancesDetalle ToEntity(BalancesDetalleUpsertDto dto)
    {
        return new BalancesDetalle
        {
            IdBalance = dto.IdBalance,
            IdCuentaContable = dto.IdCuentaContable,
            TotalDebe = dto.TotalDebe,
            TotalHaber = dto.TotalHaber,
            SaldoDeudor = dto.SaldoDeudor,
            SaldoAcreedor = dto.SaldoAcreedor
        };
    }

    protected override int GetId(BalancesDetalle entity)
    {
        return entity.IdBalanceDetalle;
    }

    protected override async Task<BalancesDetalle> RefreshCreatedEntityAsync(BalancesDetalle entity)
    {
        return await CrudService.GetByIdAsync(entity.IdBalanceDetalle) ?? entity;
    }
}
