using api.Dtos.Rrhh;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CargosController : CrudControllerBase<Cargo, CargoDto, CargoUpsertDto, int>
{
    public CargosController(ICrudService<Cargo, int> service) : base(service)
    {
    }

    protected override CargoDto ToReadDto(Cargo entity)
    {
        return new CargoDto
        {
            IdCargo = entity.IdCargo,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion,
            Activo = entity.Activo
        };
    }

    protected override Cargo ToEntity(CargoUpsertDto dto)
    {
        return new Cargo
        {
            IdCargo = dto.IdCargo,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Activo = dto.Activo
        };
    }

    protected override int GetId(Cargo entity) => entity.IdCargo;
}
