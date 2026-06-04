using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposDepositosBancariosController : CrudControllerBase<TipoDepositoBancario, TipoDepositoBancarioDto, TipoDepositoBancarioUpsertDto, int>
{
    public TiposDepositosBancariosController(ICrudService<TipoDepositoBancario, int> service) : base(service) { }

    protected override TipoDepositoBancarioDto ToReadDto(TipoDepositoBancario entity) => new()
    {
        IdTipoDepositoBancario = entity.IdTipoDepositoBancario,
        Nombre = entity.Nombre
    };

    protected override TipoDepositoBancario ToEntity(TipoDepositoBancarioUpsertDto dto) => new() { Nombre = dto.Nombre };

    protected override int GetId(TipoDepositoBancario entity) => entity.IdTipoDepositoBancario;
}
