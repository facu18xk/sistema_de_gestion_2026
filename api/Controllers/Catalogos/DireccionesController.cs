using api.Dtos.Direcciones;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DireccionesController : CrudControllerBase<Direccion, DireccionDto, DireccionUpsertDto, int>
{
    public DireccionesController(ICrudService<Direccion, int> direccionService)
        : base(direccionService)
    {
    }

    protected override DireccionDto ToReadDto(Direccion entity)
    {
        var ciudad = entity.IdCiudadNavigation;

        return new DireccionDto
        {
            IdDireccion = entity.IdDireccion,
            Calle1 = entity.Calle1,
            Calle2 = entity.Calle2,
            Descripcion = entity.Descripcion,
            IdCiudad = entity.IdCiudad,
            Ciudad = ciudad is null 
                ? null 
                : new CiudadDireccionDto 
                {
                    IdCiudad = ciudad.IdCiudad,
                    Nombre = ciudad.Nombre
                }
        };
    }

    protected override Direccion ToEntity(DireccionUpsertDto dto)
    {
        return new Direccion
        {
            IdDireccion = dto.IdDireccion,
            Calle1 = dto.Calle1,
            Calle2 = dto.Calle2,
            Descripcion = dto.Descripcion,
            IdCiudad = dto.IdCiudad
        };
    }

    protected override int GetId(Direccion entity)
    {
        return entity.IdDireccion;
    }

    protected override async Task<Direccion> RefreshCreatedEntityAsync(Direccion entity)
    {
        return await CrudService.GetByIdAsync(entity.IdDireccion) ?? entity;
    }
}