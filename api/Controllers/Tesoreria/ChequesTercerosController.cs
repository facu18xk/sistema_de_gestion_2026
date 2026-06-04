using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChequesTercerosController : CrudControllerBase<ChequeTercero, ChequeTerceroDto, ChequeTerceroUpsertDto, int>
{
    public ChequesTercerosController(ICrudService<ChequeTercero, int> service) : base(service) { }

    protected override ChequeTerceroDto ToReadDto(ChequeTercero entity) => new()
    {
        IdChequeTercero = entity.IdChequeTercero,
        IdDepositoBancario = entity.IdDepositoBancario,
        BancoEmisor = entity.BancoEmisor,
        NumeroCheque = entity.NumeroCheque,
        Librador = entity.Librador,
        FechaEmision = entity.FechaEmision,
        Monto = entity.Monto,
        Estado = entity.Estado
    };

    protected override ChequeTercero ToEntity(ChequeTerceroUpsertDto dto) => new()
    {
        IdDepositoBancario = dto.IdDepositoBancario,
        BancoEmisor = dto.BancoEmisor,
        NumeroCheque = dto.NumeroCheque,
        Librador = dto.Librador,
        FechaEmision = dto.FechaEmision,
        Monto = dto.Monto,
        Estado = dto.Estado
    };

    protected override int GetId(ChequeTercero entity) => entity.IdChequeTercero;
}
