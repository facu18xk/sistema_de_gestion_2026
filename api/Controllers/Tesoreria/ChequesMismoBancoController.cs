using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChequesMismoBancoController : CrudControllerBase<ChequeMismoBanco, ChequeMismoBancoDto, ChequeMismoBancoUpsertDto, int>
{
    public ChequesMismoBancoController(ICrudService<ChequeMismoBanco, int> service) : base(service) { }

    protected override ChequeMismoBancoDto ToReadDto(ChequeMismoBanco entity) => new()
    {
        IdChequeMismoBanco = entity.IdChequeMismoBanco,
        IdDepositoBancario = entity.IdDepositoBancario,
        NumeroCheque = entity.NumeroCheque,
        Librador = entity.Librador,
        FechaEmision = entity.FechaEmision,
        Monto = entity.Monto
    };

    protected override ChequeMismoBanco ToEntity(ChequeMismoBancoUpsertDto dto) => new()
    {
        IdDepositoBancario = dto.IdDepositoBancario,
        NumeroCheque = dto.NumeroCheque,
        Librador = dto.Librador,
        FechaEmision = dto.FechaEmision,
        Monto = dto.Monto
    };

    protected override int GetId(ChequeMismoBanco entity) => entity.IdChequeMismoBanco;
}
