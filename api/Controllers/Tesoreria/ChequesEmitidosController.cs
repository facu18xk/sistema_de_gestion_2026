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

    [HttpPost]
    public override async Task<ActionResult<ChequeEmitidoDto>> Create(ChequeEmitidoUpsertDto dto)
    {
        try
        {
            var createdEntity = await _chequeEmitidoService.CreateAsync(ToEntity(dto));
            var responseEntity = await RefreshCreatedEntityAsync(createdEntity);

            return CreatedAtAction(nameof(GetById), new { id = GetId(responseEntity) }, ToReadDto(responseEntity));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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
        Monto = dto.Monto,
        Estado = dto.Estado
    };

    protected override int GetId(ChequeEmitido entity) => entity.IdChequeEmitido;

    protected override async Task<ChequeEmitido> RefreshCreatedEntityAsync(ChequeEmitido entity)
    {
        return await CrudService.GetByIdAsync(entity.IdChequeEmitido) ?? entity;
    }
}
