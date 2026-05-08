using api.Dtos.Estados;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadosController : CrudControllerBase<Estado, EstadoDto, EstadoUpsertDto, int>
{
    public EstadosController(ICrudService<Estado, int> service)
        : base(service)
    {
    }

    protected override EstadoDto ToReadDto(Estado entity)
    {
        return new EstadoDto
        {
            IdEstado = entity.IdEstado,
            Nombre = entity.Nombre
        };
    }

    protected override Estado ToEntity(EstadoUpsertDto dto)
    {
        return new Estado
        {
            IdEstado = dto.IdEstado,
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Estado entity)
    {
        return entity.IdEstado;
    }

    protected override async Task<Estado> RefreshCreatedEntityAsync(Estado entity)
    {
        return await CrudService.GetByIdAsync(entity.IdEstado) ?? entity;
    }
}