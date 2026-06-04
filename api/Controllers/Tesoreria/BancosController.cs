using api.Dtos.Tesoreria;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BancosController : CrudControllerBase<Banco, BancoDto, BancoUpsertDto, int>
{
    public BancosController(ICrudService<Banco, int> service) : base(service) { }

    protected override BancoDto ToReadDto(Banco entity) => new()
    {
        IdBanco = entity.IdBanco,
        Nombre = entity.Nombre,
        Activo = entity.Activo
    };

    protected override Banco ToEntity(BancoUpsertDto dto) => new()
    {
        Nombre = dto.Nombre,
        Activo = dto.Activo
    };

    protected override int GetId(Banco entity) => entity.IdBanco;
}
