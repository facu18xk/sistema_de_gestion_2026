using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovimientosBancariosController : CrudControllerBase<MovimientoBancario, MovimientoBancarioDto, MovimientoBancarioUpsertDto, int>
{
    public MovimientosBancariosController(ICrudService<MovimientoBancario, int> service) : base(service) { }

    protected override MovimientoBancarioDto ToReadDto(MovimientoBancario entity) => new()
    {
        IdMovimientoBancario = entity.IdMovimientoBancario,
        IdCuentaBancaria = entity.IdCuentaBancaria,
        CuentaBancaria = entity.IdCuentaBancariaNavigation?.NumeroCuenta ?? string.Empty,
        IdTipoMovimientoBancario = entity.IdTipoMovimientoBancario,
        TipoMovimientoBancario = entity.IdTipoMovimientoBancarioNavigation?.Nombre ?? string.Empty,
        IdEstado = entity.IdEstado,
        Estado = entity.IdEstadoNavigation?.Nombre ?? string.Empty,
        IdOrdenMedioPagoCompra = entity.IdOrdenMedioPagoCompra,
        IdChequeEmitido = entity.IdChequeEmitido,
        Fecha = entity.Fecha,
        Monto = entity.Monto,
        Concepto = entity.Concepto,
        Referencia = entity.Referencia
    };

    protected override MovimientoBancario ToEntity(MovimientoBancarioUpsertDto dto) => new()
    {
        IdCuentaBancaria = dto.IdCuentaBancaria,
        IdTipoMovimientoBancario = dto.IdTipoMovimientoBancario,
        IdEstado = dto.IdEstado,
        Fecha = dto.Fecha,
        Monto = dto.Monto,
        Concepto = dto.Concepto,
        Referencia = dto.Referencia
    };

    protected override int GetId(MovimientoBancario entity) => entity.IdMovimientoBancario;

    protected override async Task<MovimientoBancario> RefreshCreatedEntityAsync(MovimientoBancario entity)
    {
        return await CrudService.GetByIdAsync(entity.IdMovimientoBancario) ?? entity;
    }
}
