using api.Dtos.Marcas;
using api.Services;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarcasController : CrudControllerBase<Marca, MarcaDto, MarcaUpsertDto, int>
{
    public MarcasController(ICrudService<Marca, int> marcaService)
        : base(marcaService)
    {
    }

    protected override MarcaDto ToReadDto(Marca entity)
    {
        return new MarcaDto
        {
            IdMarca = entity.IdMarca,
            Nombre = entity.Nombre
        };
    }

    protected override Marca ToEntity(MarcaUpsertDto dto)
    {
        return new Marca
        {
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Marca entity)
    {
        return entity.IdMarca;
    }
}
