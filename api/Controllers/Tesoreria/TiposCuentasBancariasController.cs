using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TiposCuentasBancariasController : CrudControllerBase<TipoCuentaBancaria, TipoCuentaBancariaDto, TipoCuentaBancariaUpsertDto, int>
{
    public TiposCuentasBancariasController(ICrudService<TipoCuentaBancaria, int> service) : base(service) { }

    protected override TipoCuentaBancariaDto ToReadDto(TipoCuentaBancaria entity) => new()
    {
        IdTipoCuentaBancaria = entity.IdTipoCuentaBancaria,
        Nombre = entity.Nombre
    };

    protected override TipoCuentaBancaria ToEntity(TipoCuentaBancariaUpsertDto dto) => new() { Nombre = dto.Nombre };

    protected override int GetId(TipoCuentaBancaria entity) => entity.IdTipoCuentaBancaria;
}
