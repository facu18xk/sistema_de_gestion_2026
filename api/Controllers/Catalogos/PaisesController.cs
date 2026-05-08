using api.Dtos.Paises;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaisesController : CrudControllerBase<Pais, PaisDto, PaisUpsertDto, int>
{
    public PaisesController(ICrudService<Pais, int> paisService)
        : base(paisService)
    {
    }

    protected override PaisDto ToReadDto(Pais entity)
    {
        return new PaisDto
        {
            IdPais = entity.IdPais,
            Nombre = entity.Nombre
        };
    }

    protected override Pais ToEntity(PaisUpsertDto dto)
    {
        return new Pais
        {
            IdPais = dto.IdPais,
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Pais entity)
    {
        return entity.IdPais;
    }

    protected override async Task<Pais> RefreshCreatedEntityAsync(Pais entity)
    {
        return await CrudService.GetByIdAsync(entity.IdPais) ?? entity;
    }
}