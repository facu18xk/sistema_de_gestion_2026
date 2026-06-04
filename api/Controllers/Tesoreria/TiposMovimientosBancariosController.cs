using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposMovimientosBancariosController : CrudControllerBase<TipoMovimientoBancario, TipoMovimientoBancarioDto, TipoMovimientoBancarioUpsertDto, int>
{
    public TiposMovimientosBancariosController(ICrudService<TipoMovimientoBancario, int> service) : base(service) { }

    protected override TipoMovimientoBancarioDto ToReadDto(TipoMovimientoBancario entity) => new()
    {
        IdTipoMovimientoBancario = entity.IdTipoMovimientoBancario,
        Nombre = entity.Nombre
    };

    protected override TipoMovimientoBancario ToEntity(TipoMovimientoBancarioUpsertDto dto) => new() { Nombre = dto.Nombre };

    protected override int GetId(TipoMovimientoBancario entity) => entity.IdTipoMovimientoBancario;
}
