using api.Dtos.Ciudades; 
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CiudadesController : CrudControllerBase<Ciudad, CiudadDto, CiudadUpsertDto, int>
{
    public CiudadesController(ICrudService<Ciudad, int> ciudadService)
        : base(ciudadService)
    {
    }

    protected override CiudadDto ToReadDto(Ciudad entity)
    {
        var pais = entity.IdPaisNavigation;

        return new CiudadDto
        {
            IdCiudad = entity.IdCiudad,
            IdPais = entity.IdPais,
            Nombre = entity.Nombre,
            Pais = pais is null 
                ? null 
                : new PaisCiudadDto 
                {
                    IdPais = pais.IdPais,
                    Nombre = pais.Nombre
                }
        };
    }

    protected override Ciudad ToEntity(CiudadUpsertDto dto)
    {
        return new Ciudad
        {
            IdCiudad = dto.IdCiudad, 
            IdPais = dto.IdPais,
            Nombre = dto.Nombre
        };
    }

    protected override int GetId(Ciudad entity)
    {
        return entity.IdCiudad;
    }

    protected override async Task<Ciudad> RefreshCreatedEntityAsync(Ciudad entity)
    {
        return await CrudService.GetByIdAsync(entity.IdCiudad) ?? entity;
    }
}