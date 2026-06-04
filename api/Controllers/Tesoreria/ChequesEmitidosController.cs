using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChequesEmitidosController : CrudControllerBase<ChequeEmitido, ChequeEmitidoDto, ChequeEmitidoUpsertDto, int>
{
    private readonly ChequeEmitidoService _chequeEmitidoService;

    public ChequesEmitidosController(ICrudService<ChequeEmitido, int> service, ChequeEmitidoService chequeEmitidoService)
        : base(service)
    {
        _chequeEmitidoService = chequeEmitidoService;
    }

    [HttpPost("{id:int}/conciliar")]
    public async Task<ActionResult<ChequeEmitidoDto>> Conciliar(int id, ConciliarChequeDto dto)
    {
        try
        {
            var cheque = await _chequeEmitidoService.ConciliarAsync(id, dto.FechaPago);
            return Ok(ToReadDto(cheque));
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

    protected override ChequeEmitidoDto ToReadDto(ChequeEmitido entity) => new()
    {
        IdChequeEmitido = entity.IdChequeEmitido,
        IdCuentaBancaria = entity.IdCuentaBancaria,
        CuentaBancaria = entity.IdCuentaBancariaNavigation?.NumeroCuenta ?? string.Empty,
        IdOrdenMedioPagoCompra = entity.IdOrdenMedioPagoCompra,
        IdMovimientoBancario = entity.IdMovimientoBancario,
        NumeroCheque = entity.NumeroCheque,
        Beneficiario = entity.Beneficiario,
        FechaEmision = entity.FechaEmision,
        FechaPago = entity.FechaPago,
        Monto = entity.Monto,
        Estado = entity.Estado
    };

    protected override ChequeEmitido ToEntity(ChequeEmitidoUpsertDto dto) => new()
    {
        IdCuentaBancaria = dto.IdCuentaBancaria,
        IdOrdenMedioPagoCompra = dto.IdOrdenMedioPagoCompra,
        IdMovimientoBancario = dto.IdMovimientoBancario,
        NumeroCheque = dto.NumeroCheque,
        Beneficiario = dto.Beneficiario,
        FechaEmision = dto.FechaEmision,
        FechaPago = dto.FechaPago,
        Monto = dto.Monto,
        Estado = dto.Estado
    };

    protected override int GetId(ChequeEmitido entity) => entity.IdChequeEmitido;

    protected override async Task<ChequeEmitido> RefreshCreatedEntityAsync(ChequeEmitido entity)
    {
        return await CrudService.GetByIdAsync(entity.IdChequeEmitido) ?? entity;
    }
}
