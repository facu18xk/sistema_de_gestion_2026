using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepositosBancariosController : CrudControllerBase<DepositoBancario, DepositoBancarioDto, DepositoBancarioUpsertDto, int>
{
    private readonly DepositoBancarioService _depositoBancarioService;

    public DepositosBancariosController(ICrudService<DepositoBancario, int> service, DepositoBancarioService depositoBancarioService)
        : base(service)
    {
        _depositoBancarioService = depositoBancarioService;
    }

    [HttpPost("{id:int}/confirmar")]
    public async Task<ActionResult<DepositoBancarioDto>> Confirmar(int id)
    {
        try
        {
            var deposito = await _depositoBancarioService.ConfirmarAsync(id);
            return Ok(ToReadDto(deposito));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/rechazar")]
    public async Task<ActionResult<DepositoBancarioDto>> Rechazar(int id)
    {
        try
        {
            var deposito = await _depositoBancarioService.RechazarAsync(id);
            return Ok(ToReadDto(deposito));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    protected override DepositoBancarioDto ToReadDto(DepositoBancario entity) => new()
    {
        IdDepositoBancario = entity.IdDepositoBancario,
        IdCuentaBancaria = entity.IdCuentaBancaria,
        CuentaBancaria = entity.IdCuentaBancariaNavigation?.NumeroCuenta ?? string.Empty,
        IdTipoDepositoBancario = entity.IdTipoDepositoBancario,
        TipoDepositoBancario = entity.IdTipoDepositoBancarioNavigation?.Nombre ?? string.Empty,
        IdMovimientoBancario = entity.IdMovimientoBancario,
        Fecha = entity.Fecha,
        Monto = entity.Monto,
        Concepto = entity.Concepto,
        Estado = entity.Estado
    };

    protected override DepositoBancario ToEntity(DepositoBancarioUpsertDto dto) => new()
    {
        IdCuentaBancaria = dto.IdCuentaBancaria,
        IdTipoDepositoBancario = dto.IdTipoDepositoBancario,
        Fecha = dto.Fecha,
        Monto = dto.Monto,
        Concepto = dto.Concepto
    };

    protected override int GetId(DepositoBancario entity) => entity.IdDepositoBancario;

    protected override async Task<DepositoBancario> RefreshCreatedEntityAsync(DepositoBancario entity)
    {
        return await CrudService.GetByIdAsync(entity.IdDepositoBancario) ?? entity;
    }
}
