using api.Dtos.Balances;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BalancesController : CrudControllerBase<Balance, BalanceDto, BalanceUpsertDto, int>
{
    public BalancesController(ICrudService<Balance, int> service) : base(service)
    {
    }

    protected override BalanceDto ToReadDto(Balance entity)
    {
        return new BalanceDto
        {
            IdBalance = entity.IdBalance,
            TipoBalance = entity.TipoBalance,
            IdPeriodoContable = entity.IdPeriodoContable,
            PeriodoContable = $"{entity.IdPeriodoContableNavigation?.Anho}/{entity.IdPeriodoContableNavigation?.Mes}",
            FechaGeneracion = entity.FechaGeneracion
        };
    }

    protected override Balance ToEntity(BalanceUpsertDto dto)
    {
        return new Balance
        {
            TipoBalance = dto.TipoBalance,
            IdPeriodoContable = dto.IdPeriodoContable,
            FechaGeneracion = dto.FechaGeneracion
        };
    }

    protected override int GetId(Balance entity)
    {
        return entity.IdBalance;
    }

    protected override async Task<Balance> RefreshCreatedEntityAsync(Balance entity)
    {
        return await CrudService.GetByIdAsync(entity.IdBalance) ?? entity;
    }
}
