using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CuentasBancariasController : CrudControllerBase<CuentaBancaria, CuentaBancariaDto, CuentaBancariaUpsertDto, int>
{
    public CuentasBancariasController(ICrudService<CuentaBancaria, int> service) : base(service) { }

    protected override CuentaBancariaDto ToReadDto(CuentaBancaria entity) => new()
    {
        IdCuentaBancaria = entity.IdCuentaBancaria,
        IdBanco = entity.IdBanco,
        Banco = entity.IdBancoNavigation?.Nombre ?? string.Empty,
        IdTipoCuentaBancaria = entity.IdTipoCuentaBancaria,
        TipoCuentaBancaria = entity.IdTipoCuentaBancariaNavigation?.Nombre ?? string.Empty,
        IdCuentaContable = entity.IdCuentaContable,
        CuentaContable = entity.IdCuentaContableNavigation?.Nombre ?? string.Empty,
        NumeroCuenta = entity.NumeroCuenta,
        Moneda = entity.Moneda,
        Saldo = entity.Saldo,
        SaldoDisponible = entity.SaldoDisponible,
        Activa = entity.Activa
    };

    protected override CuentaBancaria ToEntity(CuentaBancariaUpsertDto dto) => new()
    {
        IdBanco = dto.IdBanco,
        IdTipoCuentaBancaria = dto.IdTipoCuentaBancaria,
        IdCuentaContable = dto.IdCuentaContable,
        NumeroCuenta = dto.NumeroCuenta,
        Moneda = dto.Moneda,
        Saldo = dto.Saldo,
        SaldoDisponible = dto.SaldoDisponible,
        Activa = dto.Activa
    };

    protected override int GetId(CuentaBancaria entity) => entity.IdCuentaBancaria;

    protected override async Task<CuentaBancaria> RefreshCreatedEntityAsync(CuentaBancaria entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCuentaBancaria) ?? entity;
    }
}
