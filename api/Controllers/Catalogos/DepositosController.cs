using api.Dtos.Depositos;
using api.Services;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepositosController : CrudControllerBase<Deposito, DepositoDto, DepositoUpsertDto, int>
{
    public DepositosController(ICrudService<Deposito, int> depositoService)
        : base(depositoService)
    {
    }

    protected override DepositoDto ToReadDto(Deposito entity)
    {
        return new DepositoDto
        {
            IdDepsito = entity.IdDeposito,
            Nombre = entity.Nombre
        };
    }

    protected override Deposito ToEntity(DepositoUpsertDto dto)
    {
        return new Deposito
        {
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Deposito entity)
    {
        return entity.IdDeposito;
    }
}
