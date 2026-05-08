using api.Dtos.Modulos;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModulosController : CrudControllerBase<Modulo, ModuloDto, ModuloUpsertDto, int>
{
    public ModulosController(ICrudService<Modulo, int> service) : base(service)
    {
    }

    protected override ModuloDto ToReadDto(Modulo entity)
    {
        return new ModuloDto
        {
            IdModulo = entity.IdModulo,
            Nombre = entity.Nombre
        };
    }

    protected override Modulo ToEntity(ModuloUpsertDto dto)
    {
        return new Modulo
        {
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Modulo entity)
    {
        return entity.IdModulo;
    }
}
